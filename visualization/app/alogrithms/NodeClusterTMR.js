const Node_ = require('./Node_')

class NodeClusterTMR extends Node_ {

    // 争议任务，用于cluster比较
    conflictTasks = [new Set(), new Set(), new Set(), new Set()]

    // 为了去重
    brokenCores = new Set()

    brokeCoresCheckingCycle = new Map()
    // @TODO 修改加入一些核心的状态修改等等操作
    constructor(NodeID, startExec, endExec, disableCore) {
        super(NodeID, startExec, endExec)

        this.activeCore = (coreID) => {
            const success = this.brokenCores.delete(coreID)
            if(!success) throw new Error("activeCore error: " + coreID)
            this.cores[coreID].active()
            disableCore(coreID, false)
        }
        this.deactiveCore = (coreID) => {
            this.brokenCores.add(coreID)
            this.cores[coreID].deactiveCore()
            disableCore(coreID, true)
        }
    }

    ST = 0

    conflictCount = 0
    executeTaskCount = 0

    getLeaderCore() {
        if (!this.hasAvaliableCore()) throw new Error("this leader doesn't have any avaliable core to be used")
        const coresWithConflictCount = this.conflictTasks.map((set, core) => [set.size, core]).sort((a, b) => a[0] - b[0])
        const filterBroken = coresWithConflictCount.filter((a) => !this.brokenCores.has(a[1]))
        return filterBroken[0][1]
    }

    hasAvaliableCore() {
        return this.brokenCores.size !== 4
    }

    updateBrokenCoreCheckingCycle(core, cycle) {
        this.brokeCoresCheckingCycle.set(core, cycle)
    }

    async runWithOutBrokenCore(task) {
        if (this.brokenCores.size === 4) throw new Error("no more regular cores to used");
        return new Promise((resolve) => {
            // 最空闲内核优先调度
            const filterCores = this.getSortedCoresByLoad().filter((item) => !this.brokenCores.has(item.id));
            resolve([filterCores[0].calculate({...task}), filterCores[0].id])
        })
    }

    async TwoPhaseTMROnOneCore(task, funAfterExecuteEachTask) {
        const [res1] = await this.runWithOutBrokenCore(task)
        const [res2] = await this.runWithOutBrokenCore(task)
        const primaryRes = Node_.FT.TPTMR_Primary(await res1, await res2)
        if (primaryRes == "TPTMPnoPass") {
            
            const [res3] = await this.runWithOutBrokenCore(task)
            const finalRes = Node_.FT.TMR(res1, res2, await res3)
            typeof funAfterExecuteEachTask === "function" && funAfterExecuteEachTask(1, 3, finalRes)
            return [finalRes]
        } else {
            typeof funAfterExecuteEachTask === "function" && funAfterExecuteEachTask(1, 2, primaryRes)
            return [primaryRes]
        }
    }

    async auxCalFun(task, params, funAfterExecuteEachTask) {
        const {two_FreeCores, callArr, noMoreCore} = params
        if (noMoreCore) {
            const [res] = await this.TwoPhaseTMROnOneCore(task, funAfterExecuteEachTask)
            return res
        }
        // 在该两个内核上进行计算
        const result = await Promise.all(callArr)
        const primaryRes = Node_.FT.TPTMR_Primary(...result)
        // 双阶段多模冗余按需阶段
        if (primaryRes == "TPTMPnoPass") {
            // 记录争议任务, 以内核为单位
            this.executeTaskCount += 3
            this.conflictCount += 1
            this.ST = 1 - this.conflictCount / this.executeTaskCount

            if (this.brokenCores.size < 2) {
                const excludeCore = new Set([...two_FreeCores, ...this.brokenCores])
                const {callCores: lastCore, callArr: lastCallRes} = this.runOnDistinctCores(1, excludeCore, task)
                // 重新计算一次
                const c = await lastCallRes[0]
                const fullcalCores = [...two_FreeCores, ...lastCore]
                // console.log("Node Id: ", this.NodeID, " fullCalCores: ", fullcalCores)
                const [finalRes, failedCores] = Node_.FT.TMR_with_fault_core(...result, c, fullcalCores)
                if (Array.isArray(failedCores)) {
                    failedCores.forEach(core => this.conflictTasks[core].add(task.id))
                } else {
                    this.conflictTasks[failedCores].add(task.id)
                }
                if (typeof funAfterExecuteEachTask === "function") funAfterExecuteEachTask(1, 3, finalRes)
                return finalRes
            } else {
                // only two phase，没多余的内核使用了
                let c = null, lastCore = null
                try {
                    [c, lastCore] = await this.runWithOutBrokenCore(task)
                    const [finalRes, failedCores] =  Node_.FT.TMR_with_fault_core(...result, await c, [...two_FreeCores, lastCore])
                    if (Array.isArray(failedCores)) {
                        failedCores.forEach(core => this.conflictTasks[core].add(task.id))
                    } else {
                        this.conflictTasks[failedCores].add(task.id)
                    }
                    if (typeof funAfterExecuteEachTask === "function") funAfterExecuteEachTask(1, 3, finalRes)
                    return finalRes
                } catch (error) {
                    console.error(error, result, c)
                }
            }
        // 主阶段通过
        } else {
            this.executeTaskCount += 2
            this.ST = 1 - this.conflictCount / this.executeTaskCount
            const finalRes = result[0]
            if (typeof funAfterExecuteEachTask === "function") funAfterExecuteEachTask(1, 2, finalRes)
        //    console.log("Node Id: ", this.NodeID, " fullCalCores: ", two_FreeCores)
            return finalRes
        }
    }

    async runWithTwoPhaseTMRForRandomData(App, funAfterExecuteEachTask) {
        this.switchScheduleMode(Node_.mode_FCFS)
        const res = []
        for(let i = 0; i < App.length; i++) {
            let task = App[i]
            // 等待每次内核分配完后再计算, callArr是Promise
            const {callCores: two_FreeCores, callArr, noMoreCore} = this.runOnDistinctCores(2, this.brokenCores, task)
            // 不使用await 异步 防止计算阻塞内核分配
            const majorityVoteRes = this.auxCalFun(task, {
                two_FreeCores,
                callArr,
                noMoreCore
            }, funAfterExecuteEachTask)
            res.push(majorityVoteRes)
        }
        const finalRes = await Promise.all(res)
        return finalRes
    }

    async runWithTwoPhaseTMRForGraphData(App, funAfterExecuteEachTask) {
        this.switchScheduleMode(Node_.mode_LTF)
        const finalRes = await this.graphAppShedule(App, (task) => {
            // 等待每次内核分配完后再计算, callArr是Promise
            const {callCores: two_FreeCores, callArr, noMoreCore} = this.runOnDistinctCores(2, this.brokenCores, task)
            // 不使用await 异步 防止计算阻塞内核分配
            const majorityVoteRes = this.auxCalFun(task, {
                two_FreeCores,
                callArr,
                noMoreCore
            }, funAfterExecuteEachTask)
            return majorityVoteRes
        })
        console.log(finalRes)
        return finalRes
    }
}

module.exports = NodeClusterTMR

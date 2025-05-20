const Node_ = require('./Node_')
const { 
    setExperimentStateForClusterTMR,
    setSTForClusterTMR,
    deactiveCoresForClusterTMR,
    activeCoresForClusterTMR
} = require("../util")
class NodeClusterTMR extends Node_ {

    // 争议任务，用于cluster比较
    conflictTasks = [new Set(), new Set(), new Set(), new Set()]

    // 为了去重
    brokenCores = new Set()

    brokeCoresCheckingCycle = new Map()

    constructor(NodeID) {
        super(3, NodeID)
    }

    ST = 0

    conflictCount = 0
    executeTaskCount = 0

    getLeaderCore() {
        if (!this.hasAvaliableCore()) throw new Error("this leader doesn't have any hasAvaliable core to be used")
        const coresWithConflictCount = this.conflictTasks.map((set, core) => [set.size, core]).sort((a, b) => a[0] - b[0])
        const filterBroken = coresWithConflictCount.filter((a) => !this.brokenCores.has(a[1]))
        return filterBroken[0][1]
    }

    hasAvaliableCore() {
        return this.brokenCores.size !== 4
    }

    deactiveCore(core) {
        this.brokenCores.add(core)
        deactiveCoresForClusterTMR(this.NodeID, core)
        this.cores[core].deactiveCore()
    }

    updateBrokenCoreCheckingCycle(core, cycle) {
        this.brokeCoresCheckingCycle.set(core, cycle)
    }

    activeCore(core) {
        this.brokenCores.delete(core)
        activeCoresForClusterTMR(this.NodeID, core)
        this.brokeCoresCheckingCycle.delete(core)
        this.cores[core].active()
    }

    async runWithOutBrokenCore(task) {
        if (this.brokenCores.size === 4) throw new Error("no more regular cores to used");
        return new Promise((resolve) => {
            let isCalculated = false
            for (let i = 0; i < 4; i++) {
                if (!this.brokenCores.has(i)) {   
                    this.cores[i].curCalculate.then(() => {
                        if (isCalculated) return null
                        isCalculated = true
                        resolve([this.cores[i].calculate(task), i])
                    })
                }
            }
        })
    }

    async TwoPhaseTMROnOneCore(task, funAfterExecuteEachTask) {
        const [res1] = await this.runWithOutBrokenCore(task)
        const [res2] = await this.runWithOutBrokenCore(task)
        const primaryRes = Node_.FT.TPTMR_Primary(await res1, await res2)
        if (primaryRes == "TPTMPnoPass") {
            
            const [res3] = await this.runWithOutBrokenCore(task)
            const finalRes = Node_.FT.TMR(res1, res2, await res3)
            setExperimentStateForClusterTMR((prevState) => {
                const newState = [...prevState]
                newState[0] += 1
                newState[1] += 3
                if (finalRes !== 0.5) newState[3] += 1
                else newState[2] += 1
                newState[4] = newState[3] / newState[0]
                return newState
            })
            typeof funAfterExecuteEachTask === "function" && funAfterExecuteEachTask(3)
            return [finalRes]
        } else {
            setExperimentStateForClusterTMR((prevState) => {
                const newState = [...prevState]
                newState[0] += 1
                newState[1] += 2
                if (primaryRes !== 0.5) newState[3] += 1
                else newState[2] += 1
                newState[4] = newState[3] / newState[0]
                return newState
            })
            typeof funAfterExecuteEachTask === "function" && funAfterExecuteEachTask(2)
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
            setSTForClusterTMR((prevState) => {
                const newState = [...prevState]
                newState[this.NodeID] = this.ST
                return newState
            })
            if (this.brokenCores.size < 2) {
                const excludeCore = new Set([...two_FreeCores, ...this.brokenCores])
                const {freeCores: lastCore, callArr: lastCallRes} = await this.runOnDistinctFreeCores(1, excludeCore, task)
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
                
                setExperimentStateForClusterTMR((prevState) => {
                    const newState = [...prevState]
                    newState[0] += 1
                    newState[1] += 3
                    if (finalRes !== 0.5) newState[3] += 1
                    else newState[2] += 1
                    newState[4] = newState[3] / newState[0]
                    return newState
                })
                if (typeof funAfterExecuteEachTask === "function") funAfterExecuteEachTask(3)
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
                    setExperimentStateForClusterTMR((prevState) => {
                        const newState = [...prevState]
                        newState[0] += 1
                        newState[1] += 3
                        if (finalRes !== 0.5) newState[3] += 1
                        else newState[2] += 1
                        newState[4] = newState[3] / newState[0]
                        return newState
                    })
                    if (typeof funAfterExecuteEachTask === "function") funAfterExecuteEachTask(3)
                    return finalRes
                } catch (error) {
                    console.error(error, result, c)
                }
            }
        // 主阶段通过
        } else {
            this.executeTaskCount += 2
            this.ST = 1 - this.conflictCount / this.executeTaskCount
            setSTForClusterTMR((prevState) => {
                const newState = [...prevState]
                newState[this.NodeID] = this.ST
                return newState
            })
            const finalRes = result[0]
            setExperimentStateForClusterTMR((prevState) => {
                const newState = [...prevState]
                newState[0] += 1
                newState[1] += 2
                if (finalRes !== 0.5) newState[3] += 1
                else newState[2] += 1
                newState[4] = newState[3] / newState[0]
                return newState
            })
            if (typeof funAfterExecuteEachTask === "function") funAfterExecuteEachTask(2)
        //    console.log("Node Id: ", this.NodeID, " fullCalCores: ", two_FreeCores)
            return finalRes
        }
    }

    async runWithTwoPhaseTMRForDistinctCore(App, funAfterExecuteEachTask) {
        const res = []
        for(let i = 0; i < App.length; i++) {
            let task = App[i]
            // 等待每次内核分配完后再计算, callArr是Promise
            const {freeCores: two_FreeCores, callArr, noMoreCore} = await this.runOnDistinctFreeCores(2, this.brokenCores, task).catch(err => {
                if (err == "no more distinct core") return {freeCores: [], callArr: [], noMoreCore: true}
                else throw new Error(err);
            })
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
}

module.exports = NodeClusterTMR

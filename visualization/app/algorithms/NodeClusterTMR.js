const { ClusterNumber } = require('./config')
const Node_ = require('./Node_')
const Counter = require('./util/counter')
const PrimaryVote = require('./PrimaryVote')
const ViceVote = require('./ViceVote')

class NodeClusterTMR extends Node_ {

    // 争议任务，用于cluster比较
    conflictTasks = []

    // 为了去重
    brokenCores = new Set()

    brokeCoresCheckingCycle = new Map()

    leaders = []

    SS = 0

    conflictCount = 0
    executeTaskCount = 0
    
    contactCore = 0

    constructor(NodeID, coreNums, startExec, endExec, disableCore, contactCoreChange, MachineBroken) {
        super(NodeID, startExec, endExec, coreNums)
        this.conflictTasks = new Array(coreNums).fill(0).map(() => new Set())
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
        this.setContactCore = (coreID) => {
            this.contactCore = coreID;
            contactCoreChange(coreID)
        }
        this.MachineBroken = MachineBroken
        this.termCt = new Counter();
        const isContactCorePF = this.isContactCorePF.bind(this)
        const getTerm = this.termCt.getCount.bind(this.termCt)
        const getPrimaryLeader = () => this.leaders[0]
        const setPrimaryLeader = (v) => this.leaders[0] = v
        const getViceLeader = () => this.leaders[1]
        const setViceLeader = (v) => this.leaders[1] = v
        const getNodeID = () => this.NodeID
        const getSS = () => this.SS
        this.primaryVote = new PrimaryVote(
            isContactCorePF,
            getTerm,
            getPrimaryLeader,
            setPrimaryLeader,
            getNodeID,
            getSS
        )
        this.viceVote = new ViceVote(
            isContactCorePF,
            getTerm,
            getPrimaryLeader,
            getViceLeader,
            setViceLeader,
            getNodeID,
            getSS
        )
    }

   

    isContactCorePF() {
        return this.cores[this.contactCore].isPermentFault
    }
    /* 随机选一个leader core */
    /* Randomly select a leader core */
    getContactCore(avaliableBrokenCore) {
        if (!avaliableBrokenCore && !this.hasAvaliableCore()) throw new Error("no more regular cores to used");
        const avaliableCores = this.cores.filter(core => !this.brokenCores.has(core.id))
        const random = Math.floor(Math.random() * avaliableCores.length);
        this.setContactCore(avaliableCores[random].id)
        return this.contactCore
    }

    /* if the leader core is broken return a random SS value, if not, return the true one */
    genSSByContactCore() {
        if (this.isContactCorePF()) {
            return Math.random() * 1000;
        } else {
            return this.SS
        }
    }

    startVote(SSOfEachNode, nodes) {
        return new Promise((resolve) => {
            if (this.isContactCorePF()) this.termCt.count = Math.random() * 100
            else this.termCt.increase()
            // First, select out a leader and determinate the leader group
            this.primaryVote.vote(SSOfEachNode, nodes);
            this.viceVote.setVoteResolve(resolve)
        })
    }


    

    hasAvaliableCore() {
        return this.brokenCores.size !== this.coreNums
    }

    updateBrokenCoreCheckingCycle(core, cycle) {
        this.brokeCoresCheckingCycle.set(core, cycle)
    }

    async runWithOutBrokenCore(task) {
        if (this.brokenCores.size === this.coreNums) throw new Error("no more regular cores to used");
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
            this.SS = 1 - this.conflictCount / this.executeTaskCount

            if (this.brokenCores.size < 2) {
                const excludeCore = new Set([...two_FreeCores, ...this.brokenCores])
                const {callCores: lastCore, callArr: lastCallRes} = this.runOnDistinctCores(1, excludeCore, task)
                // 重新计算一次
                const c = await lastCallRes[0]
                const fullcalCores = [...two_FreeCores, ...lastCore]
                const [finalRes, failedCores] = Node_.FT.TMR_with_fault_core(...result, c, fullcalCores)
                // 让最后做决策的核心告知对方写入，若正常的核心收到错误的信息则不写入
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
            this.SS = 1 - this.conflictCount / this.executeTaskCount
            const finalRes = result[0]
            if (typeof funAfterExecuteEachTask === "function") funAfterExecuteEachTask(1, 2, finalRes)
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
        return finalRes
    }
}

module.exports = NodeClusterTMR

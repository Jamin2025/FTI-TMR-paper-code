const Node_ = require('./Node_')
const { coreNums } = require('./Core')
const { 
    setExperimentStateForReactiveTMR,
    deactiveCoresForReactiveTMR,
    activeCoresForReactiveTMR,
} = require("../util")

class NodeReactiveTMR extends Node_ {

    // 产生错误的任务列表，保存用于检测是否永久性错误
    sideTasks = [new Set(), new Set(), new Set(), new Set()]
    inTurnForSideTasks = [new Map(), new Map(), new Map(), new Map()]
    // 失败比较次数
    failedCountSideTasks = [new Map(), new Map(), new Map(), new Map()]
    // to next round, record App
    /**
     * @itemstruct {
     *  pid,
     *  round
     * }
     */
    AppRecord = []

    // 为了去重
    brokenCores = new Set()

    // 按照论文里的二维数组，column是内核数，row是任务数 bit array
    // records faults (either transient or permanent) that have occurred in the inProgress frame
    flagArr = [[], [], [], []]
    // stores the history of faults (again, either transient or permanent) that have occurred in the prior frames.
    historyArr = [[], [], [], []]

    constructor(NodeID) {
        super(2, NodeID)
    }

    activeCore(core) {
        const success = this.brokenCores.delete(core)
        if (!success) throw new Error("activeCore error: " + core)
        activeCoresForReactiveTMR(core, this.NodeID)
        this.cores[core].active()
        // console.log("active core: ", core)
    }

    addInSideTasks(taskID, core, round) {
        this.sideTasks[core].add(taskID)
        this.inTurnForSideTasks[core].set(taskID, round)
        this.failedCountSideTasks[core].set(taskID, 0)
    }

    removeInSideTasks(core, taskID) {
        if(!this.sideTasks[core].has(taskID)) return -1
        this.sideTasks[core].delete(taskID)
        this.inTurnForSideTasks[core].delete(taskID)
        this.failedCountSideTasks[core].delete(taskID)
        return this.sideTasks[core].size
    }

    deactiveCore(core) {
        this.brokenCores.add(core)
        deactiveCoresForReactiveTMR(core, this.NodeID)
        this.cores[core].deactiveCore()
    }

    // 一次round结束后复制一下bit arr并检查
    R_TMR_roundEnd(round) {
        const { flagArr, historyArr } = this
        // let wrongCore = null
        for (let core = 0; core < 4; core++) {
            const element = flagArr[core];
            for (let j = 0; j < element.length; j++) {
                if (element[j] === 0 && historyArr[core][j] === 1) {
                    historyArr[core][j] = 0
                } else if (element[j] === 1 && !historyArr[core][j]) {
                    historyArr[core][j] = 1
                    element[j] = 0
                } else if (element[j] === 1 && historyArr[core][j] === 1) {
                    historyArr[core][j] = 0
                    element[j] = 0
                    this.deactiveCore(core)
                    this.addInSideTasks(j, core, round)
                }
            }
        }
        // console.log("broken cores: ", this.brokenCores)
    }

    async runWithReactiveTMR(App, funAfterExecuteEachTask) {
        let AppRecord = this.AppRecord.find(v => v.pid == App.pid)
        if (AppRecord === undefined) {
            AppRecord = {
                pid: App.pid,
                round: 0
            }
            this.AppRecord.push(AppRecord)
        } else {
            AppRecord.round++
        }
        const res = []
        for(let i = 0; i < App.length; i++) {
            let task = App[i]
            // 等待每次内核分配完后再计算
            const {freeCores: two_FreeCores, callArr, noMoreCore} = await this.runOnDistinctFreeCores(2, this.brokenCores, task).catch(err => {
                if (err == "no more distinct core") return {freeCores: [], callArr: [], noMoreCore: true}
                else throw new Error(err);
            })
            // 不使用await 异步 防止计算阻塞内核分配
            const majorityVoteRes = this.ReactiveTMR(task, {
                two_FreeCores,
                callArr,
                noMoreCore
            }, funAfterExecuteEachTask).then(res => {
                this.tryReactiveCore(task, res, AppRecord.round, funAfterExecuteEachTask)
                return res
            })
            
            res.push(majorityVoteRes)
        }
        const finalRes = await Promise.all(res)
        this.R_TMR_roundEnd(AppRecord.round)
        return finalRes
    }

    async tryReactiveCore(task, majorityVoteRes, round, funAfterExecuteEachTask) {
        const brokenCores = this.getSideTaskOnWhichCore(task)
        const taskID = task.id
        if (brokenCores.length) {
            for (let i = 0; i < brokenCores.length; i++) {
                const brokenCore = brokenCores[i]
                // 判断该轮次是否需要比较
                if (!this.checkIfCompareRound(taskID, brokenCore, round)) return
                const tryRes = await this.cores[brokenCore].curCalculate.then(() => this.cores[brokenCore].calculate(task))
                setExperimentStateForReactiveTMR((prevState) => {
                    const newState = [...prevState]
                    newState[1] += 1
                    return newState
                })
                typeof funAfterExecuteEachTask === "function" && funAfterExecuteEachTask(0, 1, 0.5)
                if (tryRes === majorityVoteRes) {
                    if (this.removeInSideTasks(brokenCore, taskID) === 0) {
                        this.activeCore(brokenCore)
                    }
                // exponential backoff
                } else {
                    this.increaseCompareRound(brokenCore, taskID)
                }
            }
        }
    }


    getSideTaskOnWhichCore(task) {
        const cores = []
        for (let core = 0; core < 4; core++) {
            if(this.sideTasks[core].has(task.id)) {
                cores.push(core)
            }
        }
        return cores
    }

    checkIfCompareRound(taskID, brokenCore, curRound) {
        if (this.inTurnForSideTasks[brokenCore].has(taskID)) {
            const inRound = this.inTurnForSideTasks[brokenCore].get(taskID)
            const failedCount = this.failedCountSideTasks[brokenCore].get(taskID)
            const compareRound = inRound + 2 ** failedCount
            return compareRound <= curRound
        }
        throw new Error("checkIfCompareRound error");
    }

    increaseCompareRound(brokenCore, taskID) {
        if (!this.failedCountSideTasks[brokenCore].has(taskID)) {
            console.error(brokenCore, this.failedCountSideTasks)
            throw new Error("increaseCompareRound error");
        }
        const curFailedCount = this.failedCountSideTasks[brokenCore].get(taskID) + 1
        this.failedCountSideTasks[brokenCore].set(taskID, curFailedCount)
    }

    async runWithOutBrokenCore(task) {
        if (this.brokenCores.size === coreNums) throw new Error("no more regular cores to used");
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
            setExperimentStateForReactiveTMR((prevState) => {
                const newState = [...prevState]
                newState[0] += 1
                newState[1] += 3
                if (finalRes !== 0.5) newState[3] += 1
                else newState[2] += 1
                newState[4] = newState[3] / newState[0]
                return newState
            })
            typeof funAfterExecuteEachTask === "function" && funAfterExecuteEachTask(1, 3, finalRes)
            return [finalRes]
        } else {
            setExperimentStateForReactiveTMR((prevState) => {
                const newState = [...prevState]
                newState[0] += 1
                newState[1] += 2
                if (primaryRes !== 0.5) newState[3] += 1
                else newState[2] += 1
                newState[4] = newState[3] / newState[0]
                return newState
            })
            typeof funAfterExecuteEachTask === "function" && funAfterExecuteEachTask(1, 2, primaryRes)
            return [primaryRes]
        }
    }
    

    async ReactiveTMR(task, params, funAfterExecuteEachTask) {
        // 获取两个空闲内核, 三次任务在不同内核上计算。
        /**
         *@todo 直接计算，防止多次在同个内核组上计算 
         */
       
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
            /**
             * @tip
             * 按照论文 Energy-Efficient Permanent Fault Tolerance in Hard Real-Time Systems 算法
             * 不在相同的内核上进行计算
             */
            if (this.brokenCores.size < 2) {
                const excludeCore =  new Set([...two_FreeCores, ...this.brokenCores])
                const {freeCores: lastCore, callArr: lastCallRes} = await this.runOnDistinctFreeCores(1, excludeCore, task)
                // 重新计算一次
                const c = await lastCallRes[0]
                const fullcalCores = [...two_FreeCores, ...lastCore]
                // console.log("fullCalCores: ", fullcalCores)
                const [finalRes, faultCore] = Node_.FT.TMR_with_fault_core(...result, c, fullcalCores)
                // 更新错误结果历史记录, faultcore错误
                if (!Array.isArray(faultCore)) {
                    const { flagArr } = this
                    flagArr[faultCore][task.id] = 1
                }
                setExperimentStateForReactiveTMR((prevState) => {
                    const newState = [...prevState]
                    newState[0] += 1
                    newState[1] += 3
                    if (finalRes !== 0.5) newState[3] += 1
                    else newState[2] += 1
                    newState[4] = newState[3] / newState[0]
                    return newState
                })
                if (typeof funAfterExecuteEachTask === "function") funAfterExecuteEachTask(1, 3, finalRes)
                return finalRes
            } else {
                // only two phase，没多余的内核使用了
                let c = null, core3 = null
                try {
                    
                    [c, core3] = await this.runWithOutBrokenCore(task)
                    const [finalRes, faultCore] =  Node_.FT.TMR_with_fault_core(...result, await c, [two_FreeCores, core3])
                    if (!Array.isArray(faultCore)) {
                        const { flagArr } = this
                        flagArr[faultCore][task.id] = 1
                    }
                    setExperimentStateForReactiveTMR((prevState) => {
                        const newState = [...prevState]
                        newState[0] += 1
                        newState[1] += 3
                        if (finalRes !== 0.5) newState[3] += 1
                        else newState[2] += 1
                        newState[4] = newState[3] / newState[0]
                        return newState
                    })
                    if (typeof funAfterExecuteEachTask === "function") funAfterExecuteEachTask(1, 3, finalRes)
                    return finalRes
                } catch (error) {
                    console.error(error, result, c)
                }
            }
        // 主阶段通过
        } else {
            const finalRes = result[0]
            setExperimentStateForReactiveTMR((prevState) => {
                const newState = [...prevState]
                newState[0] += 1
                newState[1] += 2
                if (finalRes !== 0.5) newState[3] += 1
                else newState[2] += 1
                newState[4] = newState[3] / newState[0]
                return newState
            })
            if (typeof funAfterExecuteEachTask === "function") funAfterExecuteEachTask(1, 2, finalRes)
            // console.log("fullCalCores: ", two_FreeCores)
            return finalRes
        }
    }


}

module.exports = NodeReactiveTMR
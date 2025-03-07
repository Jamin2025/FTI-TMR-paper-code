const { coreNums, Core } = require('./Core')
const { 
    setExperimentStateForTMR,
    
    setExperimentStateForTwoPhaseTMR,

    setExperimentStateForReactiveTMR,
    deactiveCoresForReactiveTMR,
    activeCoresForReactiveTMR,

    setExperimentStateForClusterTMR
} = require("../util")
class Node {
    cores = new Array(coreNums)
    
    // 争议列表
    disList = []

    // 为了去重
    brokenCores = new Set()

    // 按照论文里的二维数组，column是内核数，row是任务数 bit array
    // records faults (either transient or permanent) that have occurred in the inProgress frame
    flagArr = [[], [], [], []]
    // stores the history of faults (again, either transient or permanent) that have occurred in the prior frames.
    historyArr = [[], [], [], []]

    // 争议任务，用于cluster比较
    conflictTasks = new Set()

    // 产生错误的任务列表，保存用于检测是否永久性错误
    sideTasks = [new Set(), new Set(), new Set(), new Set()]
    inTurnForSideTasks = [new Map(), new Map(), new Map(), new Map()]
    failedCountSideTasks = [new Map(), new Map(), new Map(), new Map()]
    // to next round, record App
    /**
     * @itemstruct {
     *  pid,
     *  round
     * }
     */
    AppRecord = []

    brokeCore(id) {
        this.cores[id].broke()
    }

    NodeID = null

    // mode 0 TMR, 1 TwoPhase TMR, 2 ReactiveTMR, 3 DashBoard
    constructor(mode, id) {
        const { cores } = this
        
        if (typeof id == "number") {
            this.NodeID = id
            for (let i = 0; i < coreNums; i++) {
                cores[i] = new Core(i, mode, id)
            }
        } else {
            for (let i = 0; i < coreNums; i++) {
                cores[i] = new Core(i, mode)
            }
        }
        
    }

    deactiveCore(core) {
        this.brokenCores.add(core)
        deactiveCoresForReactiveTMR(core)
        this.cores[core].deactiveCore()
    }

    activeCore(core) {
        const success = this.brokenCores.delete(core)
        if (!success) throw new Error("activeCore error: " + core)
        activeCoresForReactiveTMR(core)
        this.cores[core].active()
        console.log("active core: ", core)
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


    async runOnDistinctFreeCores(num, exclude, task) {
        let i = 0
        const hasExclude = exclude instanceof Set
        if (hasExclude && exclude.size === 4) throw new Error("runOnDistinctFreeCores error");
        if (hasExclude && coreNums - exclude.size < num) return Promise.reject("no more distinct core")
        const freeCoresAndCalArr = await new Promise(async (resolve, reject) => {
            let freeCores = []
            let callArr = []
            const searchs = []
            for (let j = 0; j < 4; j++) {
                // 排除掉的内核
                if (hasExclude && exclude.has(j)) continue
                searchs.push(this.cores[j].curCalculate.then(() => {
                    if (i < num) {
                        ++i
                        callArr.push(this.cores[j].calculate(task))
                        freeCores.push(j)
                        if (i === num) resolve({ freeCores, callArr })
                    }
                    return null
                })
            )
            }
            Promise.all(searchs).then(() => {
                if (i < num) reject("no more distinct core")
            })
        })
        return freeCoresAndCalArr
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
                        resolve([this.cores[i].calculate(task)])
                    })
                }
            }
        })
    }
    // 只能检测单内核永久性错误
    async ReactiveTMR(task, params) {
        // 获取两个空闲内核, 三次任务在不同内核上计算。
        /**
         *@todo 直接计算，防止多次在同个内核组上计算 
         */
       
        const {two_FreeCores, callArr, noMoreCore} = params
        if (noMoreCore) return this.runWithTwoPhaseTMR(task)
        // 在该两个内核上进行计算
        const result = await Promise.all(callArr)
        const primaryRes = FT.TPTMR_Primary(...result)
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
                console.log("fullCalCores: ", fullcalCores)
                const [finalRes, faultCore] = FT.TMR_with_fault_core(...result, c, fullcalCores)
                // 更新错误结果历史记录, faultcore错误
                if (faultCore !== null) {
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
                return finalRes
            } else {
                // only two phase，没多余的内核使用了
                let c = null
                try {
                    
                    [c] = await this.runWithOutBrokenCore(task)
                    const finalRes =  FT.TMR(...result, await c)
                    setExperimentStateForReactiveTMR((prevState) => {
                        const newState = [...prevState]
                        newState[0] += 1
                        newState[1] += 3
                        if (finalRes !== 0.5) newState[3] += 1
                        else newState[2] += 1
                        newState[4] = newState[3] / newState[0]
                        return newState
                    })
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
            console.log("fullCalCores: ", two_FreeCores)
            return finalRes
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
    
    async tryReactiveCore(task, majorityVoteRes, round) {
        const brokenCores = this.getSideTaskOnWhichCore(task)
        const taskID = task.id
        if (brokenCores.length) {
            for (let i = 0; i < brokenCores.length; i++) {
                const brokenCore = brokenCores[i]
                // 判断该轮次是否需要比较
                if (!this.checkIfCompareRound(taskID, brokenCore, round)) return
                const tryRes = await this.cores[brokenCore].curCalculate.then(() => this.cores[brokenCore].calculate(task))
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

    getTaskRunCount() {
        const count = this.cores.reduce((a, b) => {
            return a + b.calCount
        }, 0)
        return count
    }

    async runWithTMR(App) {
        const res = []
        const AppLen = App.length
        for(let i = 0; i < AppLen; i++) {
            let task = App[i]
            const { callArr: waitVotintThreeRes} = await this.runOnDistinctFreeCores(3, null, task)
            // const waitVotintThreeRes = await this.calTask(task, 0);
            // 投票异步防止阻塞
            res.push(Promise.all(waitVotintThreeRes).then(res => {
                const votRes = FT.TMR(...res);
                setExperimentStateForTMR((prev) => {
                    const news = [...prev]
                    news[1] += 3
                    if (votRes !== 0.5) news[3] += 1
                    else news[2] += 1
                    news[4] = news[3] / AppLen 
                    return news
                })
                return votRes
            }))
        }
        const finalRes = await Promise.all(res)
        return finalRes
    }

    async runWithTwoPhaseTMR(App) {
        const res = []
        const AppLen = App.length;
        for(let i = 0; i < AppLen; i++) {
            let task = App[i]
            const [ a ] = await this.runWithOutBrokenCore(task)
            const [ b ] = await this.runWithOutBrokenCore(task)
            // 投票异步防止阻塞
            const finalPromise = Promise.all([a, b]).then(async (result) => {
                const primaryRes = FT.TPTMR_Primary(...result)
                if (primaryRes == "TPTMPnoPass") {
                    try {
                        const [ c ] = await this.runWithOutBrokenCore(task)
                        const cres = await c;
                        const res = FT.TMR(...result, cres)
                        setExperimentStateForTwoPhaseTMR((prev) => {
                            const news = [...prev]
                            news[1] += 3
                            if (res !== 0.5) news[3] += 1
                            else news[2] += 1
                            news[4] = news[3] / AppLen
                            return news
                        })
                        return res
                    } catch (error) {
                        console.log(error)
                    }
                // 主阶段通过
                } else {
                    const res = result[0]
                    setExperimentStateForTwoPhaseTMR((prev) => {
                        const news = [...prev]
                        news[1] += 2
                        if (res !== 0.5) news[3] += 1
                        else news[2] += 1
                        news[4] = news[3] / AppLen
                        return news
                    })
                    return res
                }
            })
            res.push(finalPromise)
        }
        return Promise.all(res)
    }

    async auxCalFun(task, params) {
        const {two_FreeCores, callArr, noMoreCore} = params
        if (noMoreCore) return this.runWithTwoPhaseTMR(task)
            // 在该两个内核上进行计算
            const result = await Promise.all(callArr)
            const primaryRes = FT.TPTMR_Primary(...result)
            // 双阶段多模冗余按需阶段
            if (primaryRes == "TPTMPnoPass") {
                // 记录争议任务
                if (this.brokenCores.size < 2) {
                    const excludeCore = new Set([...two_FreeCores, ...this.brokenCores])
                    const {freeCores: lastCore, callArr: lastCallRes} = await this.runOnDistinctFreeCores(1, excludeCore, task)
                    // 重新计算一次
                    const c = await lastCallRes[0]
                    const fullcalCores = [...two_FreeCores, ...lastCore]
                    console.log("Node Id: ", this.NodeID, " fullCalCores: ", fullcalCores)
                    const [finalRes] = FT.TMR_with_fault_core(...result, c, fullcalCores)
                    setExperimentStateForClusterTMR((prevState) => {
                        const newState = [...prevState]
                        newState[0] += 1
                        newState[1] += 3
                        if (finalRes !== 0.5) newState[3] += 1
                        else newState[2] += 1
                        newState[4] = newState[3] / newState[0]
                        return newState
                    }) 
                    return finalRes
                } else {
                    // only two phase，没多余的内核使用了
                    let c = null
                    try {
                        [c] = await this.runWithOutBrokenCore(task)
                        const finalRes =  FT.TMR(...result, await c)
                        setExperimentStateForClusterTMR((prevState) => {
                            const newState = [...prevState]
                            newState[0] += 1
                            newState[1] += 3
                            if (finalRes !== 0.5) newState[3] += 1
                            else newState[2] += 1
                            newState[4] = newState[3] / newState[0]
                            return newState
                        })
                        return finalRes
                    } catch (error) {
                        console.error(error, result, c)
                    }
                }
            // 主阶段通过
            } else {
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
               console.log("Node Id: ", this.NodeID, " fullCalCores: ", two_FreeCores)
                return finalRes
            }
    }

    async runWithTwoPhaseTMRForDistinctCore(App) {
        const res = []
        for(let i = 0; i < App.length; i++) {
            let task = App[i]
            // 等待每次内核分配完后再计算
            const {freeCores: two_FreeCores, callArr, noMoreCore} = await this.runOnDistinctFreeCores(2, this.brokenCores, task).catch(err => {
                if (err == "no more distinct core") return {freeCores: [], callArr: [], noMoreCore: true}
                else throw new Error(err);
            })
            // 不使用await 异步 防止计算阻塞内核分配
            const majorityVoteRes = this.auxCalFun(task, {
                two_FreeCores,
                callArr,
                noMoreCore
            })
            res.push(majorityVoteRes)
        }
        const finalRes = await Promise.all(res)
        return finalRes
    }

    async runWithReactiveTMR(App) {
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
            }).then(res => {
                this.tryReactiveCore(task, res, AppRecord.round)
                return res
            })

            res.push(majorityVoteRes)
        }
        const finalRes = await Promise.all(res)
        this.R_TMR_roundEnd(AppRecord.round)
        return finalRes
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
        console.log("broken cores: ", this.brokenCores)
    }
}

class FT{
    static TMR_with_fault_core(a, b, c, cores) {
        if (a == b) return [a, cores[2]];
        if (a == c) return [c, cores[1]];
        if (b == c) return [b, cores[0]];
        console.log('TMR_with_fault_core error Majority Voting can\'nt determine the result', a, b, c)
        return [0, null];
    }

    static TMR(a, b, c){
        if (a == b) return a;
        if (a == c) return c;
        if (b == c) return b;
        console.log('TMR error Majority Voting can\'nt determine the result', a, b, c)
        return 0;
    }

    static TPTMR_Primary(a, b) {
        if (a == b) return a;
        return 'TPTMPnoPass';
    }
}

module.exports = Node

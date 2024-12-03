const { coreNums, Core } = require('./Core')
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
    constructor() {
        const { cores } = this
        for (let i = 0; i < coreNums; i++) {
            cores[i] = new Core()
        }
    }

    deactiveCore(core) {
        this.brokenCores.add(core)
    }

    activeCore(core) {
        const success = this.brokenCores.delete(core)
        if (!success) throw new Error("activeCore error: " + core)
        else console.log("active core: ", core)
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

    async TMR(task) {
        const {calArr} = await this.runOnDistinctFreeCores(3, null, task)
        const result = await Promise.all(calArr)
        try {
            return FT.TMR(result)
        } catch (error) {
            console.log(error)
        }
    }
    // @todo 等待上次的查找完成
    prevSearch = []


    async runOnDistinctFreeCores(num, exclude, task) {
        let i = 0
        await Promise.all(this.prevSearch)
        this.prevSearch = []
        const hasExclude = exclude instanceof Set
        if (hasExclude && exclude.size === 4) throw new Error("runOnDistinctFreeCores error");
        if (coreNums - exclude.size < num) return Promise.reject("no more distinct core")
        const freeCoresAndCalArr = new Promise(async (resolve, reject) => {
            let freeCores = []
            let calArr = []
            for (let j = 0; j < 4; j++) {
                // 排除掉的内核
                if (hasExclude) {
                    if (exclude.has(j)) continue
                }
                const search =this.cores[j].curCalculate.then(() => {
                    if (i < num) {
                        ++i
                        calArr.push(this.cores[j].calculate(task))
                        freeCores.push(j)
                        if (i === num) resolve({ freeCores, calArr })
                    }
                    return null
                })
                this.prevSearch.push(search)
            }
            Promise.all(this.prevSearch).then(() => {
                if (i < num) reject("no more distinct core")
            })
        })
        return freeCoresAndCalArr
    }

    async calculateWithOutBrokenCore(task) {
        if (this.brokenCores.size === coreNums) throw new Error("no more regular cores to used");
        let a = new Promise((resolve) => {
            for (let i = 0; i < 4; i++) {
                if (this.brokenCores.has(i)) {
                    continue;
                }
                let isCalculated = false
                this.cores[i].curCalculate.then(() => {
                    if (isCalculated) return null
                    isCalculated = true
                    resolve(this.cores[i].calculate(task))
                })
            }
        })
        return a
    }

    async TwoPhaseTMR(task) {
         // 在任意两个内核上进行计算
        const result = await Promise.all([this.calculateWithOutBrokenCore(task),
            this.calculateWithOutBrokenCore(task)
        ])
        const primaryRes = FT.TPTMR_Primary(result)
        // 双阶段多模冗余按需阶段
        if (primaryRes == "TPTMPnoPass") {
            try {
                const c = await this.calculateWithOutBrokenCore(task)
                return FT.TMR(...result, c)
            } catch (error) {
                console.log(error)
            }
        // 主阶段通过
        } else {
            return result[0]
        }
    }
    // 只能检测单内核永久性错误
    async ReactiveTMR(task) {
        // 获取两个空闲内核, 三次任务在不同内核上计算。
        /**
         *@todo 直接计算，防止多次在同个内核组上计算 
         */
       
        
        const {freeCores: two_FreeCores, calArr, noMoreCore} = await this.runOnDistinctFreeCores(2, this.brokenCores, task).catch(err => {
            if (err == "no more distinct core") return {freeCores: [], calArr: [], noMoreCore: true}
            else throw new Error(err);
        })
        if (noMoreCore) return this.TwoPhaseTMR(task)
        // 在该两个内核上进行计算
        const result = await Promise.all(calArr)
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
                const {freeCores: lastCore, calArr: lastCallRes} = await this.runOnDistinctFreeCores(1, excludeCore, task)
                // 重新计算一次
                const c = await lastCallRes[0]
                const fullcalCores = [...two_FreeCores, ...lastCore]
                console.log("fullCalCores: ", fullcalCores)
                const twfc = FT.TMR_with_fault_core(...result, c, fullcalCores)
                // 更新错误结果历史记录, faultcore错误
                const faultCore = twfc[1]
                const { flagArr } = this
                flagArr[faultCore][task.id] = 1
                return twfc[0]
            } else {
                // only two phase
                try {
                    const c = await this.calculateWithOutBrokenCore(task)
                    return FT.TMR(...result, c)
                } catch (error) {
                    console.log(error)
                }
            }
        // 主阶段通过
        } else {
            console.log("fullCalCores: ", two_FreeCores)
            return result[0]
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
            console.log(brokenCore, this.failedCountSideTasks)
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
            res.push(this.calTask(task, 2, AppRecord.round))
            
        }
        this.R_TMR_roundEnd(AppRecord.round)
        return Promise.all(res)
    }

    // taskid 增序
    async calTask(task, method, round) {
        
        if (method === 0) {
            // Traditional TMR
            return this.TMR(task);
        }
        if (method === 1) {
            // Twophase TMR
            return this.TwoPhaseTMR(task)
        }
        if (method === 2) {
            // Reactive TMR
            // 坏了两个Reactive TMR失效降级为TwoPhaseTMR 
            // @todo, 放这里比较是没用的
            const majorityVoteRes = await this.ReactiveTMR(task)
            this.tryReactiveCore(task, majorityVoteRes, round)
            return majorityVoteRes
            // 基于TwoPhase TMR,一些调度改变
        }
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
        if (b == c) return [b, cores[0]];;
        throw new Error('TMR error Majority Voting can\'nt determine the result');
    }

    static TMR(a, b, c){
        if (a == b) return a;
        if (a == c) return c;
        if (b == c) return b;
        throw new Error('TMR error Majority Voting can\'nt determine the result');
    }

    static TPTMR_Primary(a, b) {
        if (a == b) return a;
        return 'TPTMPnoPass';
    }
}

module.exports = Node

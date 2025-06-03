const { coreNums, Core } = require('./Core')
const Task = require("./Task")
const deepCopy = require("./util/deepCopy.js")

class Node {
    cores = new Array(coreNums)

    brokeCore(id) {
        this.cores[id].broke()
    }

    static mode_FCFS =  "FCFS"

    static mode_LTF = "LTF"

    NodeID = null

    constructor(NodeID, coreStartExec, coreEndExec) {
        const { cores } = this
        this.NodeID = NodeID
        for (let coreID = 0; coreID < coreNums; coreID++) {
            cores[coreID] = new Core(coreID, coreStartExec, coreEndExec)
        }
        // 锁定cores的顺序
        Object.freeze(this.cores)
    }

    getSortedCoresByLoad() {
        return [...this.cores].sort((a, b) => a.load - b.load)
    }

    switchScheduleMode(mode) {
        this.cores.forEach(core => core.switchScheduleMode(mode))
    }

    async graphAppShedule(App, execte) {
        App = deepCopy(App);
        const res = []
        const raceSet = new Set();
        const unScheduleTasks = new Set(App)
        while (true) {
            if (!unScheduleTasks.size) break;
            // 将没有前驱任务或前驱任务都已完成的任务加入就绪队列
            for (const originTask of unScheduleTasks) {
                if (!originTask.complete && originTask.predecessors.every(id => App[id].complete)) {
                    unScheduleTasks.delete(originTask)
                    const task = new Task(originTask.id,  originTask.duration)
                    // const waitVotintThreeRes = await this.calTask(task, 0);
                    const vote = execte(task).then((res) => {
                        originTask.complete = true
                        raceSet.delete(vote)
                        return res
                    })
                    // 投票异步防止阻塞
                    raceSet.add(vote)
                    res.push(vote)
                }
            }
            if (raceSet.size) await Promise.race([...raceSet]);
        }
        const finalRes = await Promise.all(res)
        return finalRes
    }

    // 空闲内核优先调度 lgf longest task first?
    runOnDistinctCores(num, exclude, task) {
        const hasExclude = exclude instanceof Set
        if (hasExclude && exclude.size === 4) return {freeCores: [], callArr: [], noMoreCore: true};
        if (hasExclude && coreNums - exclude.size < num) return {freeCores: [], callArr: [], noMoreCore: true}
        const callCores = []
        const callArr = []
        // 注册
        const sortedCore = this.getSortedCoresByLoad();
        const filterCores = hasExclude ? sortedCore.filter((item) => !exclude.has(item.id)) : sortedCore;
        // 最空闲内核优先调度, 任务需要被复制多份
        for (let i = 0; i < num; i++) {
            const core = filterCores[i]
            callCores.push(core.id);
            callArr.push(core.calculate({...task}))
        }
        return { callCores, callArr };
    }

    // 空闲内核优先调度
    executeTask(task) {
        const core = this.getSortedCoresByLoad()[0]
        return [core.calculate({...task}), core.id];
    }

    getExecutedTaskNum() {
        const count = this.cores.reduce((a, b) => {
            return a + b.calCount
        }, 0)
        return count
    }
    static FT = {
        TMR_with_fault_core(a, b, c, cores) {
            if (a == b) return [a, cores[2]];
            if (a == c) return [c, cores[1]];
            if (b == c) return [b, cores[0]];
            // console.log('TMR_with_fault_core error Majority Voting can\'nt determine the result', a, b, c)
            return [-1, cores];
        },
    
        TMR(a, b, c){
            if (a == b) return a;
            if (a == c) return c;
            if (b == c) return b;
            // console.log('TMR error Majority Voting can\'t determine the result', a, b, c)
            return -1;
        },
    
        TPTMR_Primary(a, b) {
            if (a == b) return a;
            return 'TPTMPnoPass';
        }
    }
    
}
module.exports = Node

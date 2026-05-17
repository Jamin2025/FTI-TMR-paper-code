const Node_ = require('./Node_')


class NodeTwoPhaseTMR extends Node_ {
    constructor(NodeID, startExec, endExec, coreNums) {
        super(NodeID, startExec, endExec, coreNums)
    }

    async auxTwoPhaseTMR(callArr, callCores, task, funAfterExecuteEachTask) {
        return Promise.all(callArr).then(async (result) => {
            const primaryRes = Node_.FT.TPTMR_Primary(...result)

            if (primaryRes == "TPTMPnoPass") {
                try {
                    const { callArr: c } = this.runOnDistinctCores(1, new Set(callCores), task)
                    const cres = await c[0];
                    const res = Node_.FT.TMR(...result, cres)
                    if (typeof funAfterExecuteEachTask === "function") funAfterExecuteEachTask(1, 3, res)
                    return res
                } catch (error) {
                    console.log(error)
                }
            // 主阶段通过
            } else {
                const res = result[0]
                if (typeof funAfterExecuteEachTask === "function") funAfterExecuteEachTask(1, 2, res)
                return res
            }
        })
    }

    async runWithTwoPhaseTMRForRandom(App, funAfterExecuteEachTask) {
        this.switchScheduleMode(Node_.mode_FCFS)
        const res = []
        const AppLen = App.length;
        for(let i = 0; i < AppLen; i++) {
            let task = App[i]
            const { callArr, callCores } = this.runOnDistinctCores(2, null, task)
            // 投票异步防止阻塞
            res.push(this.auxTwoPhaseTMR(callArr, callCores, {...task}, funAfterExecuteEachTask))
        }
        return Promise.all(res)
    }

    async runWithTwoPhaseTMRForGraph(App, funAfterExecuteEachTask) {
        this.switchScheduleMode(Node_.mode_LTF)
        return this.graphAppShedule(App, (task) => {
            const { callArr, callCores } = this.runOnDistinctCores(2, null, task)
            const vote = this.auxTwoPhaseTMR(callArr, callCores, {...task}, funAfterExecuteEachTask)
            return vote
        })
    }
}


module.exports = NodeTwoPhaseTMR

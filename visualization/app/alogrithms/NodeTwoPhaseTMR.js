const Node_ = require('./Node_')


class NodeTwoPhaseTMR extends Node_ {
    constructor(NodeID, startExec, endExec) {
        super(NodeID, startExec, endExec)
    }

    async auxTwoPhaseTMR(a, b, task, funAfterExecuteEachTask) {
        return Promise.all([a, b]).then(async (result) => {
            const primaryRes = Node_.FT.TPTMR_Primary(...result)
            if (primaryRes == "TPTMPnoPass") {
                try {
                    const [ c ] = this.executeTask(task)
                    const cres = await c;
                    const res = Node_.FT.TMR(...result, cres)
                    if (typeof funAfterExecuteEachTask === "function") funAfterExecuteEachTask(1, 3, res)
                    return res
                } catch (error) {
                    // console.log(error)
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
            const [ a ] = this.executeTask({...task})
            const [ b ] = this.executeTask({...task})
            // 投票异步防止阻塞
            res.push(this.auxTwoPhaseTMR(a, b, {...task}, funAfterExecuteEachTask))
        }
        return Promise.all(res)
    }

    async runWithTwoPhaseTMRForGraph(App, funAfterExecuteEachTask) {
        this.switchScheduleMode(Node_.mode_LTF)
        return this.graphAppShedule(App, (task) => {
            const [ a ] = this.executeTask({...task})
            const [ b ] = this.executeTask({...task})
            const vote = this.auxTwoPhaseTMR(a, b, {...task}, funAfterExecuteEachTask)
            return vote
        })
    }
}


module.exports = NodeTwoPhaseTMR

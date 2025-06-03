const Node_ = require('./Node_')


class NodeTMR extends Node_ {
    constructor(NodeID, startExec, endExec) {
        super(NodeID, startExec, endExec)
    }

    executeTaskWithTMR(task, funAfterExecuteEachTask) {
        const { callCores, callArr: waitVotintThreeRes} = this.runOnDistinctCores(3, null, task)
            // const waitVotintThreeRes = await this.calTask(task, 0);
            // 投票异步防止阻塞
        return Promise.all(waitVotintThreeRes).then(res => {
            const votRes = Node_.FT.TMR(...res);
            typeof funAfterExecuteEachTask == 'function' && funAfterExecuteEachTask(1, 3, votRes)
            return votRes
        })
    }

    async runWithTMRForRandomData(App, funAfterExecuteEachTask) {
        this.switchScheduleMode(Node_.mode_FCFS)
        const res = []
        const AppLen = App.length
        for(let i = 0; i < AppLen; i++) {
            let task = App[i]
            res.push(this.executeTaskWithTMR(task, funAfterExecuteEachTask))
        }
        const finalRes = await Promise.all(res)
        return finalRes
    }

    async runWithTMRForGraphData(App, funAfterExecuteEachTask) {
        this.switchScheduleMode(Node_.mode_LTF)
        return this.graphAppShedule(App, (task) => {
            const vote = this.executeTaskWithTMR(task, funAfterExecuteEachTask)
            return vote
        })
    }
}

module.exports = NodeTMR

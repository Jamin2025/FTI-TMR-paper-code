const Node_ = require('./Node_')

const { 
    setExperimentStateForTMR,
} = require("../util")

class NodeTMR extends Node_ {
    constructor(NodeID) {
        super(0, NodeID)
    }

    async runWithTMR(App, funAfterExecuteEachTask) {
        const res = []
        const AppLen = App.length
        for(let i = 0; i < AppLen; i++) {
            let task = App[i]
            const { callArr: waitVotintThreeRes} = await this.runOnDistinctFreeCores(3, null, task)
            // const waitVotintThreeRes = await this.calTask(task, 0);
            // 投票异步防止阻塞
            res.push(Promise.all(waitVotintThreeRes).then(res => {
                const votRes = Node_.FT.TMR(...res);
                setExperimentStateForTMR((prev) => {
                    const news = [...prev]
                    news[0] += 1
                    news[1] += 3
                    if (votRes !== 0.5) news[3] += 1
                    else news[2] += 1
                    news[4] = news[3] / news[0] 
                    return news
                })
                typeof funAfterExecuteEachTask == 'function' && funAfterExecuteEachTask(1, 3, votRes)
                return votRes
            }))
        }
        const finalRes = await Promise.all(res)
        return finalRes
    }
}

module.exports = NodeTMR

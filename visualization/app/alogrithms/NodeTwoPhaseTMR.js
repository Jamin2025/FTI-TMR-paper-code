const Node_ = require('./Node_')

const {
    setExperimentStateForTwoPhaseTMR,
} = require("../util")

class NodeTwoPhaseTMR extends Node_ {
    constructor(NodeID) {
        super(1, NodeID)
    }

    async runWithTwoPhaseTMR(App, funAfterExecuteEachTask) {
        const res = []
        const AppLen = App.length;
        for(let i = 0; i < AppLen; i++) {
            let task = App[i]
            const [ a ] = await this.executeTask(task)
            const [ b ] = await this.executeTask(task)
            // 投票异步防止阻塞
            const finalPromise = Promise.all([a, b]).then(async (result) => {
                const primaryRes = Node_.FT.TPTMR_Primary(...result)
                if (primaryRes == "TPTMPnoPass") {
                    try {
                        const [ c ] = await this.executeTask(task)
                        const cres = await c;
                        const res = Node_.FT.TMR(...result, cres)
                        setExperimentStateForTwoPhaseTMR((prev) => {
                            const news = [...prev]
                            news[0] += 1
                            news[1] += 3
                            if (res !== 0.5) news[3] += 1
                            else news[2] += 1
                            news[4] = news[3] / news[0]
                            return news
                        })
                        if (typeof funAfterExecuteEachTask === "function") funAfterExecuteEachTask(1, 3, res)
                        return res
                    } catch (error) {
                        // console.log(error)
                    }
                // 主阶段通过
                } else {
                    const res = result[0]
                    setExperimentStateForTwoPhaseTMR((prev) => {
                        const news = [...prev]
                        news[0] += 1
                        news[1] += 2
                        if (res !== 0.5) news[3] += 1
                        else news[2] += 1
                        news[4] = news[3] / news[0]
                        return news
                    })
                    if (typeof funAfterExecuteEachTask === "function") funAfterExecuteEachTask(1, 2, res)
                    return res
                }
            })
            res.push(finalPromise)
        }
        return Promise.all(res)
    }
}


module.exports = NodeTwoPhaseTMR

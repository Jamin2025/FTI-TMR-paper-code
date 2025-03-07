const Node_ = require('./Node_.js')
const poisson = require('./poisson.js')
const Task = require('./Task.js')
const { setExperimentStateForTMR, setExperimentStateForTwoPhaseTMR } = require("../util")
// const taskGraph = JSON.parse(require('./dataset/fpppp.json'))

const taskLen = 10
/**
 * @todo
 * @todo 将该任务集改成standard task graph
 * 任务构成仿真应用，交给node的是一个应用，node记录这个应用出现多少次，进行roundEnd还有回退等操作
 */
const App = new Array(taskLen).fill(null).map(() => new Task());
App.pid = 1

function PoF(arr) {
    const len = arr.length;
    let failedCount = 0
    for (let i = 0; i < len; i++) {
        if (arr[i] == "wrong") failedCount++
    }
    return failedCount / len
}
// node.brokeCore(1)

export const ReactiveTMRIntialState = {
    cores: ['Broke', 'Idel', 'Idel', 'Idel'],
    storages: ['Idel', 'Idel', 'Idel', 'Idel']
}
export async function ReactiveTMR() {
    const node = new Node_(2)
    for (let i = 0; i < 4; i++) {
        if (ReactiveTMRIntialState.cores[i] === "Broke") node.brokeCore(i)
    }
    for (let i = 0; i < 3; i++) {
        const eachAppRes = await node.runWithReactiveTMR(App)
        console.log(eachAppRes)
    }
    
}


export const TwoPhaseTMRIntialState = {
    cores: ['Broke', 'Broke', 'Idel', 'Idel'],
    storages: ['Idel', 'Idel', 'Idel', 'Idel']
}

export async function TwoPhaseTMR() {
    const node = new Node_(1)
    for (let i = 0; i < 4; i++) {
        if (TwoPhaseTMRIntialState.cores[i] === "Broke") node.brokeCore(i)
    }
    setExperimentStateForTwoPhaseTMR((prev) => {
        const news = [...prev]
        news[0] = App.length 
        return news
    })
    const eachAppRes = await node.runWithTwoPhaseTMR(App)
    console.log(eachAppRes)
    // console.log("TwoPhase TMR: ", node.getTaskRunCount())
    // console.log("PoF: ", PoF(result))
}

export const TMRIntialState = {
    cores: ['Broke', 'Broke', 'Idel', 'Idel'],
    storages: ['Idel', 'Idel', 'Idel', 'Idel']
}

export async function TMR() {
    const node = new Node_(0)
    for (let i = 0; i < 4; i++) {
        if (TMRIntialState.cores[i] === "Broke") node.brokeCore(i)
    }
    setExperimentStateForTMR((prev) => {
        const news = [...prev]
        news[0] = App.length 
        return news
    })
    const AppRes = await node.runWithTMR(App)
    console.log(AppRes)
}


export const hybirdFT_FD_InitialCoreState = [
  ['Broke', 'Idel', 'Idel', 'Idel'],
  ['Idel', 'Idel', 'Idel', 'Idel'],
  ['Broke', 'Broke', 'Broke', 'Broke'],
  ['Broke', 'Broke', 'Broke', 'Idel'],
  ['Broke', 'Broke', 'Idel', 'Idel'],
]
export const ClusterNumber = 5;
export async function hybirdFT_FD() {
    const nodes = new Array(5).fill(null).map((_, i) => new Node_(3, i))
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 4; j++) {
            if (hybirdFT_FD_InitialCoreState[i][j] === "Broke") nodes[i].brokeCore(j)
        }
    }

    for (let i = 0; i < 5; i++) {
        const eachAppRes = nodes[i].runWithTwoPhaseTMRForDistinctCore(App)
    }
}

async function test() {
    const node = new Node_()
    const App = new Array(2).fill(null).map(() => new Task());
    node.runWithReactiveTMR(App)
}
// test()
// TMR()
// TwoPhaseTMR()
// ReactiveTMR()


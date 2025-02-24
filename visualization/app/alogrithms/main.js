const Node_ = require('./Node_.js')
const poisson = require('./poisson.js')
const Task = require('./Task.js')

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
async function ReactiveTMR() {
    const node = new Node_()
    node.brokeCore(0)
    const turns = 30
    const result = []
    for (let i = 0; i < turns; i++) {
        const eachAppRes = await node.runWithReactiveTMR(App)
        console.log(eachAppRes)
        result.push(...eachAppRes)
    }
    console.log("Reactive TMR: ", node.getTaskRunCount())
    console.log("PoF: ", PoF(result))
}

async function TwoPhaseTMR() {
    const node = new Node_()
    const turns = 30
    const result = []
    for (let i = 0; i < turns; i++) {
        const eachAppRes = await node.runWithTwoPhaseTMR(App)
        console.log(eachAppRes)
        result.push(...eachAppRes)
    }
    console.log("TwoPhase TMR: ", node.getTaskRunCount())
    console.log("PoF: ", PoF(result))
}

async function TMR() {
    const node = new Node_()
    const turns = 30
    const result = []
    for (let i = 0; i < turns; i++) {
        const eachAppRes = await node.runWithTMR(App)
        console.log(eachAppRes)
        result.push(...eachAppRes)
    }
    console.log("TMR Count: ",node.getTaskRunCount())
    console.log("PoF: ", PoF(result))
}

async function test() {
    const node = new Node_()
    const App = new Array(2).fill(null).map(() => new Task());
    node.runWithReactiveTMR(App)
}

async function hybirdFT_FD() {

}

// test()
// TMR()
// TwoPhaseTMR()
ReactiveTMR()


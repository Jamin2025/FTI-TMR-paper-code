const Node_ = require('./Node_.js')
const poisson = require('./poisson.js')
const Task = require('./Task.js')

const taskLen = 10
/**
 * @todo
 * 任务构成仿真应用，交给node的是一个应用，node记录这个应用出现多少次，进行roundEnd还有回退等操作
 */
const App = new Array(taskLen).fill(null).map(() => new Task());
App.pid = 1
const node = new Node_()
node.brokeCore(0)
// node.brokeCore(1)
async function main() {
    const turns = 30
    for (let i = 0; i < turns; i++) {
        console.log(await node.runWithReactiveTMR(App), i)
    }
}

main()

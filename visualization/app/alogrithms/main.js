const Node_ = require('./Node_.js')
const poisson = require('./poisson.js')
const Task = require('./Task.js')
const NodeClusterTMR = require('./NodeClusterTMR.js')
const NodeReactiveTMR = require('./NodeReactiveTMR.js')
const NodeTwoPhaseTMR = require('./NodeTwoPhaseTMR.js')
const NodeTMR = require('./NodeTMR.js')
const { setLeaderForClusterTMR, setExperimentStateForClusterTMR } = require("../util")
// const taskGraph = JSON.parse(require('./dataset/fpppp.json'))

/**
 * @todo
 * @todo 将该任务集改成standard task graph
 * 任务构成仿真应用，交给node的是一个应用，node记录这个应用出现多少次，进行roundEnd还有回退等操作
 */

// node.brokeCore(1)
const Turn = 100

export const hybirdFT_FD_InitialCoreState = [
    ['Broke', 'Idel', 'Idel', 'Idel'],
    ['Idel', 'Idel', 'Idel', 'Idel'],
    ['Broke', 'Broke', 'Broke', 'Broke'],
    ['Broke', 'Broke', 'Broke', 'Idel'],
    ['Broke', 'Broke', 'Idel', 'Idel'],
]

export const ClusterNumber = 5;

export const ReactiveTMRIntialState = {
    cores: ['Broke', 'Idel', 'Idel', 'Idel'],
    storages: ['Idel', 'Idel', 'Idel', 'Idel']
}
export async function ReactiveTMR(AppBeTest, isRandomData, setRTMRexcutedNumsComp, setRTMRexcutedPofComp) {
    const nodes = new Array(ClusterNumber).fill(null).map((_, i) => new NodeReactiveTMR(i))
    for (let i = 0; i < ClusterNumber; i++) {
        for (let j = 0; j < 4; j++) {
            if (hybirdFT_FD_InitialCoreState[i][j] === "Broke") nodes[i].brokeCore(j)
        }
    }
    const res = []
    let taskNums = 0, excutedNums = 0, failedNums = 0;
    const newExcutedNumsComp = [], newExcutedPofComp = [];
    if (isRandomData) {
        for (let i = 0; i < Turn; i++) {
            for(let j = 0; j < ClusterNumber; j++) {
                const node = nodes[j];
                res.push(node.runWithReactiveTMR(AppBeTest, (taskNum, excutedTaskNum, taskRes) => {
                    taskNums += taskNum;
                    excutedNums += excutedTaskNum;
                    if (taskRes !== 0.5) failedNums += 1;
                    const pof = (failedNums / taskNums).toFixed(4)
                    newExcutedNumsComp.push([taskNums, excutedNums, 'R-TMR'])
                    if (taskNum !== 0) {
                        newExcutedPofComp.push([taskNums, pof, 'R-TMR'])
                        setRTMRexcutedPofComp([...newExcutedPofComp])
                    }
                    setRTMRexcutedNumsComp([...newExcutedNumsComp])
                }))
            }
            await Promise.all(res)
        }
    }
}


export const TwoPhaseTMRIntialState = {
    cores: ['Broke', 'Broke', 'Idel', 'Idel'],
    storages: ['Idel', 'Idel', 'Idel', 'Idel']
}

export async function TwoPhaseTMR(AppBeTest, isRandomData, setTPTMRexcutedNumsComp, setTPTMRexcutedPofComp) {
        // 同样也是五个机器
    const nodes = new Array(ClusterNumber).fill(null).map((_, i) => new NodeTwoPhaseTMR(i))
    for (let i = 0; i < ClusterNumber; i++) {
        for (let j = 0; j < 4; j++) {
            if (hybirdFT_FD_InitialCoreState[i][j] === "Broke") nodes[i].brokeCore(j)
        }
    }
    const res = []
    let taskNums = 0, excutedNums = 0, failedNums = 0;
    const newExcutedNumsComp = [], newExcutedPofComp = [];
    if (isRandomData) {
        for (let i = 0; i < Turn; i++) {
            for(let j = 0; j < ClusterNumber; j++) {
                const node = nodes[j];
                res.push(node.runWithTwoPhaseTMR(AppBeTest, (taskNum, excutedNum, taskRes) => {
                    taskNums += taskNum
                    excutedNums += excutedNum
                    if (taskRes !== 0.5) failedNums += 1;
                    const pof = (failedNums / taskNums).toFixed(4)
                    newExcutedNumsComp.push([taskNums, excutedNums, 'TP-TMR'])
                    newExcutedPofComp.push([taskNums, pof, 'TP-TMR'])
                    setTPTMRexcutedNumsComp([...newExcutedNumsComp])
                    setTPTMRexcutedPofComp([...newExcutedPofComp])
                }))
            }
            await Promise.all(res)
        }
    }

}

export const TMRIntialState = {
    cores: ['Broke', 'Idel', 'Idel', 'Idel']
}

export async function TMR(AppBeTest, isRandomData, setTMRExcutedNumsComp, setTMRExcutedPofComp) {
    // 同样也是五个机器
    const nodes = new Array(ClusterNumber).fill(null).map((_, i) => new NodeTMR(i))
    for (let i = 0; i < ClusterNumber; i++) {
        for (let j = 0; j < 4; j++) {
            if (hybirdFT_FD_InitialCoreState[i][j] === "Broke") nodes[i].brokeCore(j)
        }
    }
    const res = []
    let taskNums = 0, excutedNums = 0, failedNums = 0;
    const newExcutedNumsComp = [], newExcutedPofComp = [];
    if (isRandomData) {
        for (let i = 0; i < Turn; i++) {
            for(let j = 0; j < ClusterNumber; j++) {
                const node = nodes[j];
                res.push(node.runWithTMR(AppBeTest, (taskNum, excutedNum, taskRes) => {
                    taskNums += taskNum;
                    excutedNums += excutedNum;
                    if (taskRes !== 0.5) failedNums += 1;
                    const pof = (failedNums / taskNums).toFixed(4)
                    newExcutedNumsComp.push([taskNums, excutedNums, 'C-TMR'])
                    newExcutedPofComp.push([taskNums,  pof, 'C-TMR'])
                    setTMRExcutedNumsComp([...newExcutedNumsComp])
                    setTMRExcutedPofComp([...newExcutedPofComp])
                }))
            }
            await Promise.all(res)
        }
    }
    
}





async function isPass(checkCore0, checkCore1, checkCore2, beTestedCore, task, funAfterExecuteEachTask) {
    let finalRes = null;
    const arr = await Promise.all([checkCore1.calculate(task), checkCore2.calculate(task)])
    if (arr[0] !== arr[1]) {
        const res3 = await checkCore0.calculate(task)
        if (res3 === arr[0] || res3 === arr[1]) finalRes = res3
        else {
            finalRes = -1
        }
        setExperimentStateForClusterTMR((prevState) => {
            const newState = [...prevState]
            newState[1] += 4
            return newState
        })
        funAfterExecuteEachTask(0, 4, 0.5)
    } else {
        finalRes = arr[0]
        setExperimentStateForClusterTMR((prevState) => {
            const newState = [...prevState]
            newState[1] += 3
            return newState
        }) 
        funAfterExecuteEachTask(0, 4, 0.5)
    }
    const beTestedRes = await beTestedCore.calculate(task)
    return beTestedRes === finalRes
}

async function testLeadNode(Leaders, leaderCores, AppBeTest, updateLeaderCore, selfCheckingCounter, funAfterExecuteEachTask) {
    // 150–300ms
    // const deactiveCores = []
    for(let i = 0; i < 3; i++) {
        for(let core = 0; core < 4; core++) {
            const beTestedNode = Leaders[i]
            const checkCore0 = beTestedNode.cores[leaderCores[i]]
            // 指数回退
            if (beTestedNode.brokeCoresCheckingCycle.has(core)) {
                const [intialCycle, num] = beTestedNode.brokeCoresCheckingCycle.get(core)
                if (intialCycle + 2 ** num > selfCheckingCounter) {
                    continue;
                }
            }
            if (beTestedNode.conflictTasks[core].size) {
                for (let taskID of Leaders[i].conflictTasks[core]) {
                    try {
                        const task = AppBeTest[taskID]
                        const a = (i + 1) % 3;
                        const b = (i + 2) % 3;
                        const beTestedCore = beTestedNode.cores[core]
                        const checkCore1 = Leaders[a].cores[leaderCores[a]]
                        const checkCore2 = Leaders[b].cores[leaderCores[b]]
                        
                        const passTest = async () => await isPass(checkCore0, checkCore1, checkCore2, beTestedCore, task, funAfterExecuteEachTask)
                        if (await passTest() || await passTest()) {
                            beTestedNode.conflictTasks[core].delete(taskID)
                            
                        } else {
                            // deactiveCores.push([beTestedCore.NodeID, core])
                            // todo 转移该测试的leader core，如果命中
                            // i beTestedNodeIdx core beTestedCore
                            if(!beTestedNode.brokenCores.has(core)) {
                                beTestedNode.deactiveCore(core)
                                beTestedNode.updateBrokenCoreCheckingCycle(core, [selfCheckingCounter, 0])
                            } else {
                                const [_, num] = beTestedNode.brokeCoresCheckingCycle.get(core)
                                beTestedNode.updateBrokenCoreCheckingCycle(core, [selfCheckingCounter, num + 1])
                            }
                            if (leaderCores[i] === core) {
                                leaderCores = updateLeaderCore()
                            }
                            break;
                        }
                    } catch (error) {
                        console.error(error)
                        console.error(AppBeTest, taskID)
                    }
                    // Leaders[checkCore1].cores[l]
                }
            }
            if (beTestedNode.brokenCores.has(core) && beTestedNode.conflictTasks[core].size === 0) {
                beTestedNode.activeCore(core)
            }
        }
    }
    // return deactiveCores
}

async function testNoLeaderNode(Leaders, eachNode, leaderCores, AppBeTest, selfCheckingCounter, funAfterExecuteEachTask) {
    for(let i = 0; i < eachNode.length; i++) {
        for(let core = 0; core < 4; core++) {
            const beTestedNode = eachNode[i]
            const checkCore0 = Leaders[0].cores[leaderCores[0]]
            // 指数回退
            if (beTestedNode.brokeCoresCheckingCycle.has(core)) {
                const [intialCycle, num] = beTestedNode.brokeCoresCheckingCycle.get(core)
                if (intialCycle + 2 ** num > selfCheckingCounter) {
                    continue;
                }
            }
            if (beTestedNode.conflictTasks[core].size) {
                for (let taskID of eachNode[i].conflictTasks[core]) {
                    try {
                        const task = AppBeTest[taskID]
                        const beTestedCore = beTestedNode.cores[core]
                        const checkCore1 = Leaders[1].cores[leaderCores[1]]
                        const checkCore2 = Leaders[2].cores[leaderCores[2]]
                        const passTest = async () => await isPass(checkCore0, checkCore1, checkCore2, beTestedCore, task, funAfterExecuteEachTask)
                        if (await passTest() || await passTest()) {
                            beTestedNode.conflictTasks[core].delete(taskID)
                        } else {
                            if(!beTestedNode.brokenCores.has(core)) {
                                beTestedNode.deactiveCore(core)
                                beTestedNode.updateBrokenCoreCheckingCycle(core, [selfCheckingCounter, 0])
                            } else {
                                const [_, num] = beTestedNode.brokeCoresCheckingCycle.get(core)
                                beTestedNode.updateBrokenCoreCheckingCycle(core, [selfCheckingCounter, num + 1])
                            }
                            break;
                        }
                    } catch (error) {
                        console.error(error)
                        console.error(AppBeTest, taskID)
                        return
                    }
                }
            }
            // todo 指数回退
            if (beTestedNode.brokenCores.has(core) && beTestedNode.conflictTasks[core].size === 0) {
                beTestedNode.activeCore(core)
            }
        }
    }
}
export async function hybirdFT_FD(setLeaderCore, AppBeTest, isRandomData, setTPTDTMRexcutedNumsComp, setTPTDTMRexcutedPofComp) {

    let checkCycle = 2 // 指数增长的checkCycle // 极限为100轮次
    const limit = 100
    const nodes = new Array(ClusterNumber).fill(null).map((_, i) => new NodeClusterTMR(i))
    for (let i = 0; i < ClusterNumber; i++) {
        for (let j = 0; j < 4; j++) {
            if (hybirdFT_FD_InitialCoreState[i][j] === "Broke") nodes[i].brokeCore(j)
        }
    }
    // 记录用于指数回退
    let selfCheckingCounter = 0;
    let taskNums = 0, excutedNums = 0, failedNums = 0;
    const newExcutedNumsComp = [], newExcutedPofComp = [];

    function funAfterExecuteEachTask(taskNum, excutedNum, taskRes) {
        taskNums += taskNum
        excutedNums += excutedNum
        if (taskRes !== 0.5) failedNums += 1
        const pof = (failedNums / taskNums).toFixed(4)
        newExcutedNumsComp.push([taskNums, excutedNums, 'FDT-TMR'])
        setTPTDTMRexcutedNumsComp([...newExcutedNumsComp])
        if (taskNum !== 0) {
            newExcutedPofComp.push([taskNums,  pof, 'FDT-TMR'])
            setTPTDTMRexcutedPofComp([...newExcutedPofComp])
        }
    }
    // 相当于每个机器跑了Turn * AppBeTest.length个任务
    for (let turn = 1; turn <= Turn; turn++) {
        
        const res = []
        for (let i = 0; i < ClusterNumber; i++) {
            if (!nodes[i].hasAvaliableCore()) continue
            if (isRandomData) {
                res.push(nodes[i].runWithTwoPhaseTMRForDistinctCore(AppBeTest, funAfterExecuteEachTask))
            }
        }
        let toNextTurn = false
        // 进入自检周期
        while (turn % checkCycle === 0 && !toNextTurn) {
            // 在自检期间等待最终的结果先出来
            console.log("in self checking cycle")
            await Promise.all(res)
            
            selfCheckingCounter++
            if (turn < limit) checkCycle *= 2
            // election // todo去掉broken node
            const Leaders = [...nodes].filter(node => node.hasAvaliableCore()).sort((a, b) => b.ST - a.ST).slice(0, 3)
            setLeaderForClusterTMR(Leaders.map((node) => node.NodeID))
            // 选取代表core
            let leaderCores = Leaders.map((node) => node.getLeaderCore())
            setLeaderCore({
                [Leaders[0].NodeID]: leaderCores[0],
                [Leaders[1].NodeID]: leaderCores[1],
                [Leaders[2].NodeID]: leaderCores[2],
            })
            function updateLeaderCore() {
                // 更新leaderCore
                // 若有leader没有可用的core，重新当次自检
                if (Leaders.some(leader => !leader.hasAvaliableCore())) return leaderCores
                leaderCores = Leaders.map((node) => node.getLeaderCore())
                setLeaderCore({
                    [Leaders[0].NodeID]: leaderCores[0],
                    [Leaders[1].NodeID]: leaderCores[1],
                    [Leaders[2].NodeID]: leaderCores[2],
                })
                return leaderCores
            }
            // election end
            // Leader互检 0号leader由1号2号检查。1号leader由0，2号检查。2号leader由0，1号检查
            await testLeadNode(Leaders, leaderCores, AppBeTest, updateLeaderCore, selfCheckingCounter, funAfterExecuteEachTask)
            
            if (Leaders.every(leader => leader.hasAvaliableCore())) {
                // leader 检查完毕，检查非leader
                await testNoLeaderNode(Leaders, nodes.filter((node) => !Leaders.includes(node)), leaderCores, AppBeTest, selfCheckingCounter, funAfterExecuteEachTask)
                // console.log("test end")
                setLeaderCore({})
                setLeaderForClusterTMR([-1, -1, -1])
                toNextTurn = true
            } else {
                checkCycle /= 2 
                turn-- 
                selfCheckingCounter--;
                toNextTurn = false
            }
            // console.log(STs)
            // return
        }
    }
   
}

// test()
// TMR()
// TwoPhaseTMR()
// ReactiveTMR()


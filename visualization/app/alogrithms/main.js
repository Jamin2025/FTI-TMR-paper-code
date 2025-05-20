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
const Turn = 1000

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
export async function ReactiveTMR(AppBeTest, isRandomData, setRTMRexcutedNumsComp) {
    const nodes = new Array(ClusterNumber).fill(null).map((_, i) => new NodeReactiveTMR(i))
    for (let i = 0; i < ClusterNumber; i++) {
        for (let j = 0; j < 4; j++) {
            if (hybirdFT_FD_InitialCoreState[i][j] === "Broke") nodes[i].brokeCore(j)
        }
    }
    const res = []
    if (isRandomData) {
        for (let i = 0; i < Turn; i++) {
            for(let j = 0; j < ClusterNumber; j++) {
                const node = nodes[j];
                res.push(node.runWithReactiveTMR(AppBeTest, (orginalTaskNum, excutedTaskNum) => {
                    setRTMRexcutedNumsComp(excutedNumsComp => {
                        const newExcutedNumsComp = [...excutedNumsComp]
                        const len = excutedNumsComp.length;
                        if (len === 0) {
                            newExcutedNumsComp.push([orginalTaskNum, excutedTaskNum, 'R-TMR'])
                        } else {
                            const prev = excutedNumsComp[len - 1];
                            newExcutedNumsComp.push([prev[0] + orginalTaskNum, prev[1] + excutedTaskNum, 'R-TMR'])
                        }
                        return newExcutedNumsComp
                    })
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

export async function TwoPhaseTMR(AppBeTest, isRandomData, setTPTMRexcutedNumsComp) {
        // 同样也是五个机器
    const nodes = new Array(ClusterNumber).fill(null).map((_, i) => new NodeTwoPhaseTMR(i))
    for (let i = 0; i < ClusterNumber; i++) {
        for (let j = 0; j < 4; j++) {
            if (hybirdFT_FD_InitialCoreState[i][j] === "Broke") nodes[i].brokeCore(j)
        }
    }
    const res = []
    if (isRandomData) {
        for (let i = 0; i < Turn; i++) {
            for(let j = 0; j < ClusterNumber; j++) {
                const node = nodes[j];
                res.push(node.runWithTwoPhaseTMR(AppBeTest, (excutedNum) => {
                    setTPTMRexcutedNumsComp(excutedNumsComp => {
                        const newExcutedNumsComp = [...excutedNumsComp]
                        const len = excutedNumsComp.length;
                        if (len === 0) {
                            newExcutedNumsComp.push([1, excutedNum, 'TP-TMR'])
                        } else {
                            const prev = excutedNumsComp[len - 1];
                            newExcutedNumsComp.push([prev[0] + 1, prev[1] + excutedNum, 'TP-TMR'])
                        }
                        return newExcutedNumsComp
                    })
                }))
            }
            await Promise.all(res)
        }
    }

}

export const TMRIntialState = {
    cores: ['Broke', 'Idel', 'Idel', 'Idel']
}

export async function TMR(AppBeTest, isRandomData, setTMRExcutedNumsComp) {
    // 同样也是五个机器
    const nodes = new Array(ClusterNumber).fill(null).map((_, i) => new NodeTMR(i))
    for (let i = 0; i < ClusterNumber; i++) {
        for (let j = 0; j < 4; j++) {
            if (hybirdFT_FD_InitialCoreState[i][j] === "Broke") nodes[i].brokeCore(j)
        }
    }
    const res = []
    if (isRandomData) {
        for (let i = 0; i < Turn; i++) {
            for(let j = 0; j < ClusterNumber; j++) {
                const node = nodes[j];
                res.push(node.runWithTMR(AppBeTest, (excutedNum) => {
                    setTMRExcutedNumsComp((excutedNumsComp) => {
                        const newExcutedNumsComp = [...excutedNumsComp]
                        const len = excutedNumsComp.length;
                        if (len === 0) {
                            newExcutedNumsComp.push([1, excutedNum, 'C-TMR'])
                        } else {
                            const prev = excutedNumsComp[len - 1];
                            newExcutedNumsComp.push([prev[0] + 1, prev[1] + excutedNum, 'C-TMR'])
                        }
                        return newExcutedNumsComp
                    })
                }))
            }
            await Promise.all(res)
        }
    }
    
}





async function isPass(checkCore0, checkCore1, checkCore2, beTestedCore, task, setTPTDTMRexcutedNumsComp) {
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
        setTPTDTMRexcutedNumsComp(excutedNumsComp => {
            const newD = [...excutedNumsComp]
            const prevLast = newD[newD.length - 1]
            newD.push([prevLast[0], prevLast[1] + 4, 'FDT-TMR'])
            return newD
        })
       
    } else {
        finalRes = arr[0]
        setExperimentStateForClusterTMR((prevState) => {
            const newState = [...prevState]
            newState[1] += 3
            return newState
        }) 
        setTPTDTMRexcutedNumsComp(excutedNumsComp => {
            const newD = [...excutedNumsComp]
            const prevLast = newD[newD.length - 1]
            newD.push([prevLast[0], prevLast[1] + 3, 'FDT-TMR'])
            return newD
        })
    }
    const beTestedRes = await beTestedCore.calculate(task)
    return beTestedRes === finalRes
}

async function testLeadNode(Leaders, leaderCores, AppBeTest, updateLeaderCore, selfCheckingCounter, setTPTDTMRexcutedNumsComp) {
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
                        
                        const passTest = async () => await isPass(checkCore0, checkCore1, checkCore2, beTestedCore, task, setTPTDTMRexcutedNumsComp)
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

async function testNoLeaderNode(Leaders, eachNode, leaderCores, AppBeTest, selfCheckingCounter, setTPTDTMRexcutedNumsComp) {
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
                        const passTest = async () => await isPass(checkCore0, checkCore1, checkCore2, beTestedCore, task, setTPTDTMRexcutedNumsComp)
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
export async function hybirdFT_FD(setLeaderCore, AppBeTest, isRandomData, setTPTDTMRexcutedNumsComp) {

    let checkCycle = 2 // 指数增长的checkCycle // 极限为100轮次
    const limit = 100
    const nodes = new Array(ClusterNumber).fill(null).map((_, i) => new NodeClusterTMR(i))
    for (let i = 0; i < ClusterNumber; i++) {
        for (let j = 0; j < 4; j++) {
            if (hybirdFT_FD_InitialCoreState[i][j] === "Broke") nodes[i].brokeCore(j)
        }
    }
    let selfCheckingCounter = 0
    // 相当于每个机器跑了Turn * AppBeTest.length个任务
    for (let turn = 1; turn <= Turn; turn++) {
        
        const res = []
        for (let i = 0; i < ClusterNumber; i++) {
            if (!nodes[i].hasAvaliableCore()) continue
            if (isRandomData) {
                res.push(nodes[i].runWithTwoPhaseTMRForDistinctCore(AppBeTest, (excutedNum) => {
                    setTPTDTMRexcutedNumsComp((excutedNumsComp) => {
                        const newExcutedNumsComp = [...excutedNumsComp]
                        const len = excutedNumsComp.length;
                        if (len === 0) {
                            newExcutedNumsComp.push([1, excutedNum, 'FDT-TMR'])
                        } else {
                            const prev = excutedNumsComp[len - 1];
                            newExcutedNumsComp.push([prev[0] + 1, prev[1] + excutedNum, 'FDT-TMR'])
                        }
                        return newExcutedNumsComp
                    })
                }))
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
            await testLeadNode(Leaders, leaderCores, AppBeTest, updateLeaderCore, selfCheckingCounter, setTPTDTMRexcutedNumsComp)
            
            if (Leaders.every(leader => leader.hasAvaliableCore())) {
                // leader 检查完毕，检查非leader
                await testNoLeaderNode(Leaders, nodes.filter((node) => !Leaders.includes(node)), leaderCores, AppBeTest, selfCheckingCounter, setTPTDTMRexcutedNumsComp)
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

async function test() {
    const node = new Node_()
    const AppBeTest = new Array(2).fill(null).map(() => new Task());
    node.runWithReactiveTMR(AppBeTest)
}
// test()
// TMR()
// TwoPhaseTMR()
// ReactiveTMR()


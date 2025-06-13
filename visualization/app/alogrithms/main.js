const NodeClusterTMR = require('./NodeClusterTMR.js')
const NodeReactiveTMR = require('./NodeReactiveTMR.js')
const NodeTwoPhaseTMR = require('./NodeTwoPhaseTMR.js')
const NodeTMR = require('./NodeTMR.js')
const {coreNums, ClusterNumber, InitialCoreState, Turn, updateExperimentFrequency} = require('./config.js');
const throttle = require('./util/throttle.js')
// const { setLeaderForClusterTMR, setExperimentStateForClusterTMR } = require("../util")
// const taskGraph = JSON.parse(require('./dataset/fpppp.json'))




function genCoreStartExecution(NodeID, setCoresState) {
    return (id) => {
        setCoresState((prevCoreState) => {
            const newCoreState = [...prevCoreState]
            const cores = [...newCoreState[NodeID]]
            cores[id] = "Busy"
            newCoreState[NodeID] = cores
            return newCoreState
        })
    }
}

function genCoreEndExecution(NodeID, setCoresState) {
    return (id, isPermentFault) => {
        setCoresState((prevCoreState) => {
            const newCoreState = [...prevCoreState]
            const cores = [...newCoreState[NodeID]]
            cores[id] = isPermentFault ? "Broke" : "Idel"
            newCoreState[NodeID] = cores
            return newCoreState
        })
    }
}

function genCoreActiveStateChange(NodeID, setCoresDisabled) {
    return (coreId, isActive) => {
        setCoresDisabled((prevCoreState) => {
            const newCoreState = [...prevCoreState]
            const cores = [...newCoreState[NodeID]]
            cores[coreId] = isActive
            newCoreState[NodeID] = cores
            return newCoreState
        })
    }
}

export async function TMR(AppBeTest, isRandomData, setTMRExcutedNumsComp, setTMRExcutedPofComp, setCoresState, setExperimentStatesForTMR) {
    // 节流实验数据
    // 同样也是五个机器
    const nodes = new Array(ClusterNumber).fill(null).map(
        (_, NodeID) => 
            new NodeTMR(NodeID, genCoreStartExecution(NodeID, setCoresState), genCoreEndExecution(NodeID, setCoresState), coreNums)
    )
    for (let i = 0; i < ClusterNumber; i++) {
        for (let j = 0; j < coreNums; j++) {
            if (InitialCoreState[i][j] === "Broke") nodes[i].brokeCore(j)
        }
    }
    
    let orginalTaskNums = 0, excutedTaskNums = 0;
    const newExcutedNumsComp = [], newExcutedPofComp = [];
    
    let failedAppNum = 0, excutedAppNum = 0;
    for (let turn = 1; turn <= Turn; turn++) {
        const ClusterRes = []
        for (let j = 0; j < ClusterNumber; j++) {
            const node = nodes[j];
            let eachAppRes = null;
            let isWrong = false
            const excuteAfterEachTask = (taskNum, excutedNum, taskRes) => {
                orginalTaskNums += taskNum;
                excutedTaskNums += excutedNum;
                if (!isWrong && taskRes !== 0.5) isWrong = true;
            }
            if (isRandomData) {
                eachAppRes = node.runWithTMRForRandomData(AppBeTest, excuteAfterEachTask)
            } else {
                eachAppRes = node.runWithTMRForGraphData(AppBeTest, excuteAfterEachTask)
            }
           
            ClusterRes.push(eachAppRes)
            eachAppRes.then(() => ++excutedAppNum && isWrong && failedAppNum++)
        }
        await Promise.all(ClusterRes)
        // 数据更新降低频次
        if (turn % updateExperimentFrequency === 0 || turn === 1) {
            const Pof = (failedAppNum / excutedAppNum).toFixed(9)
            newExcutedNumsComp.push([excutedAppNum, excutedTaskNums, 'C-TMR'])
            newExcutedPofComp.push([excutedAppNum, Pof, 'C-TMR'])
            setTMRExcutedNumsComp([...newExcutedNumsComp])
            setTMRExcutedPofComp([...newExcutedPofComp])
            setExperimentStatesForTMR([excutedAppNum, excutedTaskNums, excutedAppNum - failedAppNum, failedAppNum, Pof])
        }
        
        // setExperimentStatesForTMR(prev => [...prev.slice(0, 4), (failedCounter / Turn)])
    }
    
    return null;
}

export async function TwoPhaseTMR(AppBeTest, isRandomData, setTPTMRexcutedNumsComp, setTPTMRexcutedPofComp, setCoresState, setExperimentStatesForTwoPhaseTMR) {
    // setTPTMRexcutedNumsComp = throttle(setTPTMRexcutedNumsComp, 10000)
    // setTPTMRexcutedPofComp = throttle(setTPTMRexcutedPofComp, 10000)
    // 同样也是五个机器
    const nodes = new Array(ClusterNumber).fill(null).map(
        (_, NodeID) => 
            new NodeTwoPhaseTMR(NodeID, genCoreStartExecution(NodeID, setCoresState), genCoreEndExecution(NodeID, setCoresState), coreNums)
    )


    for (let i = 0; i < ClusterNumber; i++) {
        for (let j = 0; j < coreNums; j++) {
            if (InitialCoreState[i][j] === "Broke") nodes[i].brokeCore(j)
        }
    }
    let taskNums = 0, excutedTaskNums = 0;
    const newExcutedNumsComp = [], newExcutedPofComp = [];
    let failedAppNum = 0, excutedAppNum = 0;

    for (let turn = 1; turn <= Turn; turn++) {
        const ClusterRes = []
        for (let j = 0; j < ClusterNumber; j++) {
            const node = nodes[j];
            let eachAppRes = null;
            let isWrong = false
            const excuteAfterEachTask = (taskNum, excutedNum, taskRes) => {
                taskNums += taskNum
                excutedTaskNums += excutedNum
                if (!isWrong && taskRes !== 0.5) isWrong = true
                
            }
            if (isRandomData) eachAppRes = node.runWithTwoPhaseTMRForRandom(AppBeTest, excuteAfterEachTask)
            else eachAppRes = node.runWithTwoPhaseTMRForGraph(AppBeTest, excuteAfterEachTask)
            ClusterRes.push(eachAppRes)
            eachAppRes.then(() => ++excutedAppNum && isWrong && failedAppNum++)
        }
        await Promise.all(ClusterRes)
        // 数据更新降低频次
        if (turn % updateExperimentFrequency === 0 || turn === 1) {
            const Pof = (failedAppNum / excutedAppNum).toFixed(9)
            newExcutedNumsComp.push([excutedAppNum, excutedTaskNums, 'TP-TMR'])
            setTPTMRexcutedNumsComp([...newExcutedNumsComp])
            newExcutedPofComp.push([excutedAppNum, Pof, 'TP-TMR'])
            setTPTMRexcutedPofComp([...newExcutedPofComp])
            // 更新单个组件的实验数据
            setExperimentStatesForTwoPhaseTMR([excutedAppNum, excutedTaskNums, excutedAppNum - failedAppNum, failedAppNum, Pof])
        }
    }
    console.log(taskNums)
}




export async function ReactiveTMR(AppBeTest, isRandomData, setRTMRexcutedNumsComp, setRTMRexcutedPofComp, setCoresState, setExperimentState, setCoresDisabled) {

    const nodes = new Array(ClusterNumber).fill(null).map(
        (_, NodeID) =>
            new NodeReactiveTMR(NodeID, genCoreStartExecution(NodeID, setCoresState), genCoreEndExecution(NodeID, setCoresState), genCoreActiveStateChange(NodeID, setCoresDisabled), coreNums)
    );
    for (let i = 0; i < ClusterNumber; i++) {
        for (let j = 0; j < coreNums; j++) {
            if (InitialCoreState[i][j] === "Broke") nodes[i].brokeCore(j)
        }
    }
    let taskNums = 0, excutedTaskNums = 0, failedNums = 0;
    const newExcutedNumsComp = [], newExcutedPofComp = [];
    let failedAppNum = 0, excutedAppNum = 0;

    

    for (let turn = 1; turn <= Turn; turn++) {
        const ClusterRes = []
        for (let j = 0; j < ClusterNumber; j++) {
            const node = nodes[j];
            let isWrong = false
            let eachAppRes = null;
            const excuteAfterEachTask = (taskNum, excutedNum, taskRes) => {
                taskNums += taskNum
                excutedTaskNums += excutedNum
                const notTryReactive = !!taskNum
                if (notTryReactive && !isWrong && taskRes !== 0.5) isWrong = true
            }
            if (isRandomData) eachAppRes = node.runWithReactiveTMRForRandom(AppBeTest, excuteAfterEachTask)
            else eachAppRes = node.runWithReactiveTMRForGraph(AppBeTest, excuteAfterEachTask)
            ClusterRes.push(eachAppRes)
            eachAppRes.then(() => ++excutedAppNum && isWrong && failedAppNum++)
        }
        await Promise.all(ClusterRes)
        if (turn % updateExperimentFrequency === 0 || turn === 1) {
            const pof = (failedAppNum / excutedAppNum).toFixed(9)
            newExcutedNumsComp.push([excutedAppNum, excutedTaskNums, 'R-TMR'])
            setRTMRexcutedNumsComp([...newExcutedNumsComp])
            newExcutedPofComp.push([excutedAppNum, pof, 'R-TMR'])
            setRTMRexcutedPofComp([...newExcutedPofComp])
            // 更新单个组件的实验数据
            setExperimentState([excutedAppNum, excutedTaskNums, excutedAppNum - failedAppNum, failedAppNum, pof])
        }
    }
}













async function isPass(checkCore0, checkCore1, checkCore2, beTestedCore, task, funAfterExecuteEachTask) {
    let finalRes = null;
    const arr = await Promise.all([checkCore1.calculate({...task}), checkCore2.calculate({...task})])
    if (arr[0] !== arr[1]) {
        const res3 = await checkCore0.calculate({...task})
        if (res3 === arr[0] || res3 === arr[1]) finalRes = res3
        else {
            finalRes = -1
        }
        funAfterExecuteEachTask(0, 4, 0.5)
    } else {
        finalRes = arr[0]
        funAfterExecuteEachTask(0, 4, 0.5)
    }
    const beTestedRes = await beTestedCore.calculate({...task})
    return beTestedRes === finalRes
}

async function testLeadNode(Leaders, leaderCores, AppBeTest, updateLeaderCore, selfCheckingCounter, funAfterExecuteEachTask) {
    // 150–300ms
    // const deactiveCores = []
    for (let i = 0; i < 3; i++) {
        for (let core = 0; core < coreNums; core++) {
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
                            // i beTestedNodeIdx core beTestedCore
                            if (!beTestedNode.brokenCores.has(core)) {
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
    for (let i = 0; i < eachNode.length; i++) {
        for (let core = 0; core < coreNums; core++) {
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
                            if (!beTestedNode.brokenCores.has(core)) {
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
            if (beTestedNode.brokenCores.has(core) && beTestedNode.conflictTasks[core].size === 0) {
                beTestedNode.activeCore(core)
            }
        }
    }
}
export async function hybirdFT_FD(setLeaderCore,
    AppBeTest, isRandomData, setTPTDTMRexcutedNumsComp, setTPTDTMRexcutedPofComp,
    setExperimentStates, setCoresState,
    setCoresDisabled, setSTs,
    setThreeLeaderNode
) {

    let checkCycle = 2 // 指数增长的checkCycle // 极限为100轮次
    const limit = 100
    const nodes = new Array(ClusterNumber).fill(null).map(
        (_, NodeID) => 
            new NodeClusterTMR(NodeID, genCoreStartExecution(NodeID, setCoresState), genCoreEndExecution(NodeID, setCoresState), genCoreActiveStateChange(NodeID, setCoresDisabled), coreNums)
    )
    for (let i = 0; i < ClusterNumber; i++) {
        for (let j = 0; j < coreNums; j++) {
            if (InitialCoreState[i][j] === "Broke") nodes[i].brokeCore(j)
        }
    }
    // 记录用于指数回退
    let selfCheckingCounter = 0;
    let taskNums = 0, excutedTaskNums = 0, failedNums = 0;
    const newExcutedNumsComp = [], newExcutedPofComp = [];
    let failedAppNum = 0, excutedAppNum = 0;
    function updateAfterEachTaskExecuted(taskNum, excutedNum) {
        taskNums += taskNum
        excutedTaskNums += excutedNum
    }

    
    // 相当于每个机器跑了Turn * AppBeTest.length个任务
    for (let turn = 1; turn <= Turn; turn++) {

        const ClusterRes = []
        for (let i = 0; i < ClusterNumber; i++) {
            if (!nodes[i].hasAvaliableCore()) continue
            let eachAppRes = null;
            let isWrong = false
            
            function wrapIsAPPFailedUpdateAfterEachTaskExecuted(taskNum, excutedNum, taskRes) {
                updateAfterEachTaskExecuted(taskNum, excutedNum)
                const notTryReactive = !!taskNum
                if (notTryReactive && !isWrong && taskRes !== 0.5) isWrong = true
            }

            if (isRandomData) {
                eachAppRes = nodes[i].runWithTwoPhaseTMRForRandomData(AppBeTest, wrapIsAPPFailedUpdateAfterEachTaskExecuted)
            } else {
                eachAppRes = nodes[i].runWithTwoPhaseTMRForGraphData(AppBeTest, wrapIsAPPFailedUpdateAfterEachTaskExecuted)
            }
            eachAppRes.then(() => ++excutedAppNum && isWrong && failedAppNum++)
            ClusterRes.push(eachAppRes)
        }
        await Promise.all(ClusterRes)
        
        let toNextTurn = false
        // 进入自检周期
        while (turn % checkCycle === 0 && !toNextTurn) {
            // 在自检期间等待最终的结果先出来
            console.log("in self checking cycle")
            selfCheckingCounter++
            if (turn < limit) checkCycle *= 2
            // election // todo去掉broken node
            const Leaders = [...nodes].filter(node => node.hasAvaliableCore()).sort((a, b) => b.ST - a.ST).slice(0, 3)
            setThreeLeaderNode(Leaders.map((node) => node.NodeID))
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
            await testLeadNode(Leaders, leaderCores, AppBeTest, updateLeaderCore, selfCheckingCounter, updateAfterEachTaskExecuted)

            if (Leaders.every(leader => leader.hasAvaliableCore())) {
                // leader 检查完毕，检查非leader
                await testNoLeaderNode(Leaders, nodes.filter((node) => !Leaders.includes(node)), leaderCores, AppBeTest, selfCheckingCounter, updateAfterEachTaskExecuted)
                // console.log("test end")
                setLeaderCore({})
                setThreeLeaderNode([-1, -1, -1])
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
        // 数据更新降低频次
        if (turn % updateExperimentFrequency === 0 || turn === 1) {
            const pof = (failedAppNum / excutedAppNum).toFixed(9)
            newExcutedPofComp.push([excutedAppNum, pof, 'FDT-TMR'])
            newExcutedNumsComp.push([excutedAppNum, excutedTaskNums, 'FDT-TMR'])
            setTPTDTMRexcutedNumsComp([...newExcutedNumsComp])
            setTPTDTMRexcutedPofComp([...newExcutedPofComp])
            setSTs(nodes.map(node => node.ST))
            setExperimentStates([excutedAppNum, excutedTaskNums, excutedAppNum - failedAppNum, failedAppNum, pof])
        }
    }

}

// test()
// TMR()
// TwoPhaseTMR()
// ReactiveTMR()


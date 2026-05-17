const NodeClusterTMR = require('./NodeClusterTMR.js')
const NodeReactiveTMR = require('./NodeReactiveTMR.js')
const NodeTwoPhaseTMR = require('./NodeTwoPhaseTMR.js')
const NodeTMR = require('./NodeTMR.js')
const {coreNums, ClusterNumber, InitialCoreState, Turn, updateExperimentFrequency} = require('./config.js');
// const { setLeaderForClusterTMR, setExperimentStateForClusterTMR } = require("../util")
// const taskGraph = JSON.parse(require('./dataset/fpppp.json'))
// todo 不同情况的实验
// todo 全损坏机器，整体标红，检测逻辑挪入每个机器内部，一些坏机器的边界case需要完善



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
    let taskNums = 0, excutedTaskNums = 0;
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













async function isPass(checkCore0, checkCore1, beTestedCore, task, funAfterExecuteEachTask) {
    const arr = await Promise.all([checkCore1.calculate({...task}), checkCore0.calculate({...task})])
    funAfterExecuteEachTask(0, 3)
    const beTestedRes = await beTestedCore.calculate({...task})
    return beTestedRes === arr[0] || beTestedRes === arr[1]
}

async function testNoLeaderNode(Leaders, eachNode, contactCoreOfEachNode, AppBeTest, selfCheckingCounter, funAfterExecuteEachTask) {
    for (let i = 0; i < eachNode.length; i++) {
        const beTestedNode = eachNode[i]
        const brokenCoreRecord = []
        for (let core = 0; core < coreNums; core++) {
            
            const checkCore0 = Leaders[0].cores[contactCoreOfEachNode.get(Leaders[0].NodeID)]
            beTestedNode.setContactCore(core)
            // 指数回退
            if (beTestedNode.brokeCoresCheckingCycle.has(core)) {
                const [intialCycle, num] = beTestedNode.brokeCoresCheckingCycle.get(core)
                if (selfCheckingCounter < intialCycle + 2 ** num ) {
                    continue;
                }
            }
            if (beTestedNode.conflictTasks[core].size) {
                for (let taskID of beTestedNode.conflictTasks[core]) {
                    try {
                        const task = AppBeTest[taskID]
                        const beTestedCore = beTestedNode.cores[core]
                        const checkCore1 = Leaders[1].cores[contactCoreOfEachNode.get(Leaders[0].NodeID)]
                        const passTest = async () => await isPass(checkCore0, checkCore1, beTestedCore, task, funAfterExecuteEachTask)
                        if (await passTest() || await passTest()) {
                            beTestedNode.conflictTasks[core].delete(taskID)
                        } else {
                            if (!beTestedNode.brokenCores.has(core)) {
                                brokenCoreRecord.push(core)
                                // beTestedNode.deactiveCore(core)
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
        // there has functional core
        if (brokenCoreRecord.length !== coreNums) {
            for (let core of brokenCoreRecord) {
                beTestedNode.deactiveCore(core)
            }
        // there is no functional core
        } else {
            beTestedNode.MachineBroken(true)
        }
        
    }
}

function genContactCoresChange(NodeID, setContactCores) {
    return (coreID) => {
        setContactCores(prev =>  {
            const newmap = new Map(prev)
            newmap.set(NodeID, coreID)
            return newmap
        })
    }
}

function genBrokenMachineChange(NodeID, setBrokenMachines) {
    return (isBroken) => {
        setBrokenMachines(prev =>  {
            const newset = new Set(prev)
            if (isBroken) newset.add(NodeID)
            else newset.delete(NodeID)
            return newset
        })
    }
}

export async function hybirdFT_FD(setContactCores,
    AppBeTest, isRandomData, setTPTDTMRexcutedNumsComp, setTPTDTMRexcutedPofComp,
    setExperimentStates, setCoresState,
    setCoresDisabled, setSTs,
    setTwoLeaderNode, setBrokenMachines
) {

    let checkCycle = 2 // 指数增长的checkCycle // 极限为100轮次
    const limit = 100
    const nodes = new Array(ClusterNumber).fill(null).map(
        (_, NodeID) => 
            new NodeClusterTMR(
                NodeID,
                coreNums,
                genCoreStartExecution(NodeID, setCoresState),
                genCoreEndExecution(NodeID, setCoresState),
                genCoreActiveStateChange(NodeID, setCoresDisabled),
                genContactCoresChange(NodeID, setContactCores),
                genBrokenMachineChange(NodeID, setBrokenMachines)
            )
    )
    Object.freeze(nodes)
    for (let i = 0; i < ClusterNumber; i++) {
        for (let j = 0; j < coreNums; j++) {
            if (InitialCoreState[i][j] === "Broke") nodes[i].brokeCore(j)
        }
    }
    // 记录用于指数回退
    let selfCheckingCounter = 0;
    let excutedTaskNums = 0;
    const newExcutedNumsComp = [], newExcutedPofComp = [];
    let failedAppNum = 0, excutedAppNum = 0;
    function updateAfterEachTaskExecuted(_, excutedNum) {
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
            /* Start election  */
            /* Step1 Each Node select a contact core of themself. additional tasks execute */
          
            const contactCoreOfEachNode = new Map(nodes.filter(node => node.hasAvaliableCore()).map(node => [node.NodeID,node.getContactCore()]));
            /* Step2 Each contact core of respective node exchanges SS value; */
            /* contact core which is broken return wrong SS value */
          
            const SSOfEachNode = nodes.map(node => [node.genSSByContactCore(), node.NodeID]);
            Object.freeze(SSOfEachNode)
            /* Step3 Each contact core launch the voting for two leader, primary and vice, broken core generate wrong vote; */
         
            
            const votedNodes = await new Promise(resolve =>  {
                let arr = [];
                for (let node of nodes) {
                    node.startVote(SSOfEachNode, nodes).then(res => {
                        // console.log(res)
                        const half = Math.floor(ClusterNumber / 2)
                        if (arr.length <= half) {
                            arr.push(res)
                        }
                        if (arr.length > half) {
                            resolve(arr)
                        }
                    })
                }
            })
            console.log('resolved: ', votedNodes)
            const Leaders = votedNodes[0][0].map(idx =>  nodes[idx])
            setTwoLeaderNode([...votedNodes[0][0]])
            
            // election end
            // @Optional TODO 1, 由正常的core去关闭不正常的核心的使用，即最后关闭，2，检测等逻辑应写入node当中。3若找不到正常的core，则整个node变红。最后只和好core再联系一次
            // verify no leader core whether broken?
            await testNoLeaderNode(Leaders, nodes.filter((node) => !Leaders.includes(node)), contactCoreOfEachNode, AppBeTest, selfCheckingCounter, updateAfterEachTaskExecuted)
            /** 模拟检错期间的任务消耗 start */ 
            // voting
            updateAfterEachTaskExecuted(0, 2 * (ClusterNumber ** 2 + 2 * ClusterNumber))
            // heartBeat
            updateAfterEachTaskExecuted(0, 2 * ClusterNumber)
            // fault checking
            updateAfterEachTaskExecuted(0, 2 * coreNums * ClusterNumber + 2 * ClusterNumber)
            // notfication
            updateAfterEachTaskExecuted(0, ClusterNumber) 
            /** 模拟检错期间的任务消耗 end */
            setContactCores(new Map())
            setTwoLeaderNode([-1, -1])
            toNextTurn = true
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
            setSTs(nodes.map(node => node.SS))
            setExperimentStates([excutedAppNum, excutedTaskNums, excutedAppNum - failedAppNum, failedAppNum, pof])
        }
    }

}

// test()
// TMR()
// TwoPhaseTMR()
// ReactiveTMR()


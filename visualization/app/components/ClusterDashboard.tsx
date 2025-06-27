"use client";
import { DashboardContainer, ClusterGrid } from "./styledComp";
import { hybirdFT_FD } from "../alogrithms/main";
import Machine from "./Machine";
import { ExperimentRow } from "./ExperimentResult";
import { useState } from "react";
import StatusInfoBar from "./StatusInfoBar";
import {InitialCoreState, ClusterNumber, coreNums} from "../alogrithms/config"





const ClusterDashboard = ({AppBeTest, isRandomData, setTPTDTMRexcutedNumsComp, setTPTDTMRexcutedPofComp}: any) => {
    const [coresState, setCoresState] = useState(InitialCoreState)
    const [experimentStates, setExperimentStates] = useState([0,0,0,0,0])
    const [STs, setSTs] = useState(new Array(ClusterNumber).fill(0))
    const [coresDisabled, setCoresDisabled] = useState(
      new Array(ClusterNumber).fill(null).map(() => new Array(coreNums).fill(false))
    )
    const [threeLeaderNode, setThreeLeaderNode] = useState<number[]>([-1, -1, -1])
    const [leaderCore, setLeaderCore] = useState<any>({})

    // useEffect(() => {
    //   insetCoreStateForClusterTMR(setCoresState)
    //   insetExperimentStateForClusterTMR(setExperimentStates)
    //   insetCoresDisabledForClusterTMR(setCoresDisabled)
    //   insetSTForClusterTMR(setSTs)
    //   insetLeaderForClusterTMR(setThreeLeaderNode)
    // }, [])

    function startExperiment() {
      // 让统计数据最后出来。
      hybirdFT_FD(setLeaderCore, AppBeTest, isRandomData, 
        setTPTDTMRexcutedNumsComp, setTPTDTMRexcutedPofComp,
        setExperimentStates, setCoresState, 
        setCoresDisabled, setSTs, 
        setThreeLeaderNode
      )
    }

    return (
      <div className="flex w-full justify-around pb-20">
      <DashboardContainer>
        <h1 className="text-2xl font-bold mt-5">Cluster Dashboard</h1>
        <div className="pt-20 relative bottom-10 left-10" >
          <StatusInfoBar />
        </div>
        <ClusterGrid>
          {Array(ClusterNumber).fill(null).map((_, nodeId: number) => (
            <Machine
              key={nodeId}
              machineId={nodeId}
              coreState={coresState[nodeId]}
              coresDisabled={coresDisabled[nodeId]}
              coreNums={coreNums}
              isLeader={threeLeaderNode.includes(nodeId)}
              leaderCore={leaderCore}
            />
          ))}
        </ClusterGrid>
        <button className="border border-gray-200 py-2 px-4 rounded" onClick={startExperiment}>Start Experiment</button>
      </DashboardContainer>
      <DashboardContainer>
            <h1 className="text-2xl font-bold mt-5 mb-5">Experiment Result</h1>
            <ExperimentRow>Apps Executed: {experimentStates[0]}</ExperimentRow>
            <ExperimentRow>Tasks Executed: {experimentStates[1]}</ExperimentRow>
            <ExperimentRow>Accurate Executions: {experimentStates[2]}</ExperimentRow>
            <ExperimentRow>Faulty Executions: {experimentStates[3]}</ExperimentRow>
            <ExperimentRow>PoF: {experimentStates[4]}</ExperimentRow>
            <ExperimentRow>ST: {STs.map(item => item.toFixed(4)).join(" ")}</ExperimentRow>
            <ExperimentRow>Leader: {threeLeaderNode.map(a => a == -1 ? null : a + 1).join(", ")}</ExperimentRow>
      </DashboardContainer>
      </div>
    );
};

export default ClusterDashboard

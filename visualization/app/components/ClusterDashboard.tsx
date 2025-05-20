"use client";
import { DashboardContainer, ClusterGrid } from "./styledComp";
import { insetCoreStateForClusterTMR, insetExperimentStateForClusterTMR, insetSTForClusterTMR, insetLeaderForClusterTMR, insetCoresDisabledForClusterTMR } from "../util/index"
import { hybirdFT_FD_InitialCoreState, ClusterNumber, hybirdFT_FD } from "../alogrithms/main";
import Machine from "./Machine";
import { ExperimentRow } from "./ExperimentResult";
import { useEffect, useState, useRef } from "react";
import StatusInfoBar from "./StatusInfoBar";





const ClusterDashboard = ({AppBeTest, isRandomData, setTPTDTMRexcutedNumsComp}: any) => {
    const [coresState, setCoresState] = useState(hybirdFT_FD_InitialCoreState)
    const [experimentStates, setExperimentStates] = useState([0,0,0,0,0])
    const [STs, setSTs] = useState(new Array(ClusterNumber).fill(0))
    const [coresDisabled, setCoresDisabled] = useState(
      new Array(ClusterNumber).fill(null).map(() => new Array(4).fill(false))
    )
    const [threeLeaderNode, setThreeLeaderNode] = useState<number[]>([-1, -1, -1])
    const [leaderCore, setLeaderCore] = useState<any>({})

    useEffect(() => {
      insetCoreStateForClusterTMR(setCoresState)
      insetExperimentStateForClusterTMR(setExperimentStates)
      insetCoresDisabledForClusterTMR(setCoresDisabled)
      insetSTForClusterTMR(setSTs)
      insetLeaderForClusterTMR(setThreeLeaderNode)
    }, [])

    function startExperiment() {
      // 让统计数据最后出来。
      hybirdFT_FD(setLeaderCore, AppBeTest, isRandomData, setTPTDTMRexcutedNumsComp)
      console.log("start experiment")
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
              isLeader={threeLeaderNode.includes(nodeId)}
              leaderCore={leaderCore}
            />
          ))}
        </ClusterGrid>
        <button className="border border-gray-200 py-2 px-4 rounded" onClick={startExperiment}>Start Experiment</button>
      </DashboardContainer>
      <DashboardContainer>
            <h1 className="text-2xl font-bold mt-5 mb-5">Experiment Result</h1>
            <ExperimentRow>Original task: {experimentStates[0]}</ExperimentRow>
            <ExperimentRow>Executed task: {experimentStates[1]}</ExperimentRow>
            <ExperimentRow>Correct result: {experimentStates[2]}</ExperimentRow>
            <ExperimentRow>Faulty result: {experimentStates[3]}</ExperimentRow>
            <ExperimentRow>PoF: {experimentStates[4].toFixed(4)}</ExperimentRow>
            <ExperimentRow>ST: {STs.map(i => i.toFixed(4)).join(" ")}</ExperimentRow>
            <ExperimentRow>Leader: {threeLeaderNode.map(a => a == -1 ? null : a + 1).join(", ")}</ExperimentRow>
      </DashboardContainer>
      </div>
    );
};

export default ClusterDashboard

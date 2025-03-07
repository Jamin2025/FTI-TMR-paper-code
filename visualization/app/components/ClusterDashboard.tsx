"use client";
import { DashboardContainer, ClusterGrid } from "./styledComp";
import { insetCoreStateForClusterTMR, setExperimentStateForClusterTMR, insetSTForClusterTMR } from "../util/index"
import { hybirdFT_FD_InitialCoreState, ClusterNumber, hybirdFT_FD } from "../alogrithms/main";
import Machine from "./Machine";
import { ExperimentRow } from "./ExperimentResult";
import { useEffect, useMemo, useState } from "react";





const ClusterDashboard = () => {
    const [coresState, setCoresState] = useState(hybirdFT_FD_InitialCoreState)
    const [experimentStates, setExperimentStates] = useState([0,0,0,0,0])
    const [STs, setSTs] = useState(new Array(ClusterNumber).fill(0))
    const [coresDisabled, setCoresDisabled] = useState(
      new Array(ClusterNumber).fill(null).map(() => new Array(4).fill(false))
    )

    useEffect(() => {
      insetCoreStateForClusterTMR(setCoresState)
      setExperimentStateForClusterTMR(setExperimentStates)
      setExperimentStateForClusterTMR(setCoresDisabled)
      // insetSTForClusterTMR(setSTs)
    }, [])

    function startExperiment() {
      hybirdFT_FD()
      console.log("start experiment")
    }

    return (
      <div className="flex w-full justify-around pb-20">
      <DashboardContainer>
        <h1 className="text-2xl font-bold mt-5 mb-5">Cluster Dashboard</h1>
        <ClusterGrid>
          {Array(ClusterNumber).fill(null).map((_, nodeId) => (
            <Machine
              key={nodeId}
              machineId={nodeId + 1}
              coreState={coresState[nodeId]}
              coresDisabled={coresDisabled[nodeId]}
            />
          ))}
        </ClusterGrid>
        <button className="border border-gray-200 py-2 px-4 rounded" onClick={startExperiment}>Start Experiment</button>
      </DashboardContainer>
      <DashboardContainer>
            <h1 className="text-2xl font-bold mt-5 mb-5">Experiment Result</h1>
            <ExperimentRow>Original task: {experimentStates[0]}</ExperimentRow>
            <ExperimentRow>Executed task: {experimentStates[1]}</ExperimentRow>
            <ExperimentRow>Right result: {experimentStates[2]}</ExperimentRow>
            <ExperimentRow>Wrong result: {experimentStates[3]}</ExperimentRow>
            <ExperimentRow>PoF: {experimentStates[4].toFixed(4)}</ExperimentRow>
            <ExperimentRow>ST: {STs.map(i => i.toFixed(4))}</ExperimentRow>
      </DashboardContainer>
      </div>
    );
};

export default ClusterDashboard

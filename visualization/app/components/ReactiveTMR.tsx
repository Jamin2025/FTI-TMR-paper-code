"use client"
import { DashboardContainer } from "./styledComp";
import Machine  from "./Machine";
import ExperimentResult from './ExperimentResult'
import { useState, useEffect, useRef } from "react";
import { ReactiveTMR, hybirdFT_FD_InitialCoreState, ClusterNumber } from "../alogrithms/main"

const ReactiveTMRDashboard = ({AppBeTest, isRandomData, setRTMRexcutedNumsComp, setRTMRexcutedPofComp}: any) => {
    const [coresState, setCoresState] = useState(hybirdFT_FD_InitialCoreState)
    
    // const [storageState, setStorageState] = useState(ReactiveTMRIntialState.storages)
    const [coresDisabled, setCoresDisabled] = useState(new Array(ClusterNumber).fill(null).map(() => new Array(4).fill(false)))
    const [experimentStates, setExperimentState] = useState([0, 0, 0, 0, 0])

    return (
        <div className="flex w-full justify-around">
        <div className="w-[720px] flex justify-center">
          <DashboardContainer>
          
            <h1 className="text-2xl font-bold mt-5 mb-5">Reactive TMR Dashboard</h1>
            <div className="flex w-[720px] flex-wrap justify-start" >
              {Array(ClusterNumber).fill(null).map((_, nodeId: number) => (
                <Machine
                  key={nodeId}
                  machineId={nodeId}
                  coreState={coresState[nodeId]}
                  coresDisabled={coresDisabled[nodeId]}
                />
              ))}
            </div>
            <button className="border border-gray-200 py-2 px-4 rounded" onClick={() => ReactiveTMR(AppBeTest, isRandomData, setRTMRexcutedNumsComp, setRTMRexcutedPofComp, setCoresState, setExperimentState, setCoresDisabled)}>Start Experiment</button>
            
          </DashboardContainer>
        </div>
        <ExperimentResult experimentStates={experimentStates} />
      </div>
    )
}

export default ReactiveTMRDashboard


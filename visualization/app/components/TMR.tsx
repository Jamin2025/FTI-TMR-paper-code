"use client"
import { DashboardContainer } from "./styledComp";
import Machine  from "./Machine";
import ExperimentResult from './ExperimentResult'
import { useState, useEffect, useRef } from "react";
import { TMR, hybirdFT_FD_InitialCoreState, ClusterNumber } from "../alogrithms/main"
// import LJFSchedule from "../alogrithms/listSchedule"
import { insetCoreStateForTMR, insetExperimentStateForTMR } from "../util/index"

const TMRDashboard = ({AppBeTest, isRandomData, setTMRExcutedNumsComp, setTMRExcutedPofComp}: any) => {
    
  const [coresState, setCoresState] = useState(hybirdFT_FD_InitialCoreState)
  const [experimentStates, setExperimentStatesForTMR] = useState([0, 0, 0, 0, 0])
  
    
    // 注册保存一下方法 
    // register and save the method
    useEffect(() => {
      insetCoreStateForTMR(setCoresState)
      insetExperimentStateForTMR(setExperimentStatesForTMR)
        // TMR()
    }, [])

    function startTMRExperiment() {
      TMR(AppBeTest, isRandomData, setTMRExcutedNumsComp, setTMRExcutedPofComp)
    }

    return (
      <div className="flex w-full justify-around">
        <div className="w-[720px] flex justify-center">
          <DashboardContainer>
          
            <h1 className="text-2xl font-bold mt-5 mb-5">TMR Dashboard</h1>
            <div className="flex w-[720px] flex-wrap justify-start" >
              {Array(ClusterNumber).fill(null).map((_, nodeId: number) => (
                <Machine
                  key={nodeId}
                  machineId={nodeId}
                  coreState={coresState[nodeId]}
                />
              ))}
            </div>
            <button className="border border-gray-200 py-2 px-4 rounded" onClick={startTMRExperiment}>Start Experiment</button>
            
          </DashboardContainer>
        </div>
        <ExperimentResult experimentStates={experimentStates} />
      </div>
    );
};

export default TMRDashboard

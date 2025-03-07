"use client"
import { DashboardContainer } from "./styledComp";
import Machine  from "./Machine";
import ExperimentResult from './ExperimentResult'
import { useState, useEffect } from "react";
import { TMR, TMRIntialState } from "../alogrithms/main"
import { insetCoreStateForTMR, insetExperimentStateForTMR, insetStorageStateForTMR } from "../util/index"

const TMRDashboard = () => {
    
    const [coreState, setCoreState] = useState(TMRIntialState.cores)

    // const [storageState, setStorageState] = useState(TMRIntialState.storages)
    
    const [experimentStates, setExperimentStatesForTMR] = useState([0, 0, 0, 0, 0])
  
    
    // 注册保存一下方法 
    // register and save the method
    useEffect(() => {
        insetCoreStateForTMR(setCoreState)
        // insetStorageStateForTMR(setStorageState)
        insetExperimentStateForTMR(setExperimentStatesForTMR)
        // TMR()
    }, [])

    return (
      <div className="flex w-full justify-around">
        <div className="w-[720px] flex justify-center">
          <DashboardContainer>
          
            <h1 className="text-2xl font-bold mt-5 mb-5">TMR Dashboard</h1>
            <Machine 
                machineId={1}
                coreState={coreState}
                // storageState={storageState}
            />
            <button className="border border-gray-200 py-2 px-4 rounded" onClick={TMR}>Start Experiment</button>
            
          </DashboardContainer>
        </div>
        <ExperimentResult experimentStates={experimentStates} />
      </div>
    );
};

export default TMRDashboard

"use client"
import { DashboardContainer } from "./styledComp";
import Machine  from "./Machine";
import ExperimentResult from './ExperimentResult'
import { useState, useEffect } from "react";
import { ReactiveTMR, ReactiveTMRIntialState } from "../alogrithms/main"
import { insetCoreStateForReactiveTMR, insetExperimentStateForReactiveTMR, insetStorageStateForReactiveTMR, insetCoresDisabledForReactiveTMR } from "../util/index"

const ReactiveTMRDashboard = () => {
    const [coreState, setCoreState] = useState(ReactiveTMRIntialState.cores)
    
        // const [storageState, setStorageState] = useState(ReactiveTMRIntialState.storages)
        const [coresDisabled, setCoresDisabled] = useState([false, false, false, false])
        const [experimentStates, setExperimentState] = useState([0, 0, 0, 0, 0])
      
        
        // 注册保存一下方法 
        // register and save the method
        useEffect(() => {
            insetCoreStateForReactiveTMR(setCoreState)
            // insetStorageStateForReactiveTMR(setStorageState)
            insetExperimentStateForReactiveTMR(setExperimentState)
            insetCoresDisabledForReactiveTMR(setCoresDisabled)
            // // TMR()
        }, [])

    return (
        <div className="flex w-full justify-around">
        <div className="w-[720px] flex justify-center">
          <DashboardContainer>
          
            <h1 className="text-2xl font-bold mt-5 mb-5">Reactive TMR Dashboard</h1>
            <Machine 
                machineId={1}
                coreState={coreState}
                coresDisabled={coresDisabled}
                // storageState={storageState}
            />
            <button className="border border-gray-200 py-2 px-4 rounded" onClick={ReactiveTMR}>Start Experiment</button>
            
          </DashboardContainer>
        </div>
        <ExperimentResult experimentStates={experimentStates} />
      </div>
    )
}

export default ReactiveTMRDashboard


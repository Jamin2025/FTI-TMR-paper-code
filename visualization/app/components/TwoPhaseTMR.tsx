"use client"
import { DashboardContainer } from "./styledComp";
import Machine  from "./Machine";
import ExperimentResult from './ExperimentResult'
import { useState, useEffect } from "react";
import { TwoPhaseTMR, TwoPhaseTMRIntialState } from "../alogrithms/main"
import { insetCoreStateForTwoPhaseTMR, insetExperimentStateForTwoPhaseTMR, insetStorageStateForTwoPhaseTMR } from "../util/index"

const TwoPhaseTMRDashboard = () => {
    const [coreState, setCoreState] = useState(TwoPhaseTMRIntialState.cores)
    
        // const [storageState, setStorageState] = useState(TwoPhaseTMRIntialState.storages)
        
        const [experimentStates, setExperimentStateForTMR] = useState([0, 0, 0, 0, 0])
      
        
        // 注册保存一下方法 
        // register and save the method
        useEffect(() => {
            insetCoreStateForTwoPhaseTMR(setCoreState)
            // insetStorageStateForTwoPhaseTMR(setStorageState)
            insetExperimentStateForTwoPhaseTMR(setExperimentStateForTMR)
           
            // // TMR()
        }, [])

    return (
        <div className="flex w-full justify-around">
        <div className="w-[720px] flex justify-center">
          <DashboardContainer>
          
            <h1 className="text-2xl font-bold mt-5 mb-5">Two Phase TMR Dashboard</h1>
            <Machine 
                machineId={1}
                coreState={coreState}
                // storageState={storageState}
            />
            <button className="border border-gray-200 py-2 px-4 rounded" onClick={TwoPhaseTMR}>Start Experiment</button>
            
          </DashboardContainer>
        </div>
        <ExperimentResult experimentStates={experimentStates} />
      </div>
    )
}

export default TwoPhaseTMRDashboard


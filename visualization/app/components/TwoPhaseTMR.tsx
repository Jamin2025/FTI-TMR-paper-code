"use client"
import { DashboardContainer } from "./styledComp";
import Machine  from "./Machine";
import ExperimentResult from './ExperimentResult'
import { useState } from "react";
import { TwoPhaseTMR } from "../alogrithms/main"
import { InitialCoreState, ClusterNumber, coreNums} from "../alogrithms/config"

const TwoPhaseTMRDashboard = ({AppBeTest, isRandomData, setTPTMRexcutedNumsComp, setTPTMRexcutedPofComp}: any) => {
    const [coresState, setCoresState] = useState(InitialCoreState)
    
    const [experimentStates, setExperimentStateForTwoPhaseTMR] = useState([0, 0, 0, 0, 0])

    return (
        <div className="flex w-full justify-around">
        <div className="w-[720px] flex justify-center">
          <DashboardContainer>
          
            <h1 className="text-2xl font-bold mt-5 mb-5">Two Phase TMR Dashboard</h1>
            <div className="flex w-[720px] flex-wrap justify-start" >
              {Array(ClusterNumber).fill(null).map((_, nodeId: number) => (
                <Machine
                  key={nodeId}
                  machineId={nodeId}
                  coreState={coresState[nodeId]}
                  coreNums={coreNums}
                />
              ))}
            </div>
            <button className="border border-gray-200 py-2 px-4 rounded" onClick={() => TwoPhaseTMR(AppBeTest, isRandomData, setTPTMRexcutedNumsComp, setTPTMRexcutedPofComp, setCoresState, setExperimentStateForTwoPhaseTMR)}>Start Experiment</button>
            
          </DashboardContainer>
        </div>
        <ExperimentResult experimentStates={experimentStates} />
      </div>
    )
}

export default TwoPhaseTMRDashboard


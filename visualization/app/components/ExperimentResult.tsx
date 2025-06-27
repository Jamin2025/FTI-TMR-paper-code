import { DashboardContainer } from "./styledComp";

const ExperimentResult = ({experimentStates}: {experimentStates: number[]}) => {
 
  return (
    <DashboardContainer>
      <h1 className="text-2xl font-bold mt-5 mb-5">Experiment Result</h1>
      <ExperimentRow>Apps Executed: {experimentStates[0]}</ExperimentRow>
      <ExperimentRow>Tasks Executed: {experimentStates[1]}</ExperimentRow>
      <ExperimentRow>Accurate Executions: {experimentStates[2]}</ExperimentRow>
      <ExperimentRow>Faulty Executions: {experimentStates[3]}</ExperimentRow>
      <ExperimentRow>PoF: {experimentStates[4]}</ExperimentRow>
    </DashboardContainer>
  )
}

export const ExperimentRow: React.FC<{children: React.ReactNode}> = ({children}) => {
    return <div className="mt-2">{children}</div>
}

export default ExperimentResult


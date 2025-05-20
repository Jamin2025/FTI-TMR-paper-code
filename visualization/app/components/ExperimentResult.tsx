import { DashboardContainer } from "./styledComp";

const ExperimentResult = ({experimentStates}: {experimentStates: number[]}) => {
 
  return (
    <DashboardContainer>
      <h1 className="text-2xl font-bold mt-5 mb-5">Experiment Result</h1>
      <ExperimentRow>Original task: {experimentStates[0]}</ExperimentRow>
      <ExperimentRow>Executed task: {experimentStates[1]}</ExperimentRow>
      <ExperimentRow>Correct result: {experimentStates[2]}</ExperimentRow>
      <ExperimentRow>Faulty result: {experimentStates[3]}</ExperimentRow>
      <ExperimentRow>PoF: {experimentStates[4].toFixed(4)}</ExperimentRow>
    </DashboardContainer>
  )
}

export const ExperimentRow: React.FC<{children: React.ReactNode}> = ({children}) => {
    return <div className="mt-2">{children}</div>
}

export default ExperimentResult


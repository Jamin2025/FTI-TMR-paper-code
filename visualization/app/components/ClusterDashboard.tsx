import { DashboardContainer, ClusterGrid, CpuCore, StorageCore } from "./styledComp";
import Machine from "./Machine";
import DeviceState from "./State"

const StatusInfoBar = () => (
    <div className="w-[800px]">
        <div className="state ml-5 flex items-center w-[400px] justify-between">
            Cores: 
            <div className="flex items-center">
            <span className="mr-2 ml-2"><CpuCore state={DeviceState[0]}/></span> Idle 
            <span className="mr-2 ml-2"><CpuCore state={DeviceState[1]}/></span> Busy 
            <span className="mr-2 ml-2"><CpuCore state={DeviceState[2]}/></span> Damaged 
            <span className="mr-2 ml-2"><CpuCore state={DeviceState[0]} disabled/></span> Disabled 
            </div>
        </div>

        <div className="state ml-5 flex items-center w-[400px] justify-between">
            Storages: 
            <div className="flex items-center">
            <span className="mr-2 ml-2"><StorageCore state={DeviceState[0]}/></span> Normal 
            <span className="mr-2 ml-2"><StorageCore state={DeviceState[2]}/></span> Damaged 
            <span className="mr-2 ml-2"><StorageCore state={DeviceState[0]} disabled/></span> Disabled 
            </div>
        </div>
        
    </div>
)

const ClusterDashboard = () => {
    return (
      <DashboardContainer>
        <h1 className="text-2xl font-bold mt-5 mb-5">Cluster Dashboard</h1>
        <StatusInfoBar />
        <ClusterGrid>
          {[...Array(5)].map((_, index) => (
            <Machine key={index} machineId={index + 1} />
          ))}
        </ClusterGrid>
        <h1 className="text-2xl font-bold mt-5 mb-5">Experiment Result</h1>
      </DashboardContainer>
    );
};

export default ClusterDashboard
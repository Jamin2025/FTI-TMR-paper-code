import DeviceState from "./State"
import { CpuCore, StorageCore } from "./styledComp";

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

        {/* <div className="state ml-5 flex items-center w-[400px] justify-between">
            Storages: 
            <div className="flex items-center">
            <span className="mr-2 ml-2"><StorageCore state={DeviceState[0]}/></span> Normal 
            <span className="mr-2 ml-2"><StorageCore state={DeviceState[2]}/></span> Damaged 
            <span className="mr-2 ml-2"><StorageCore state={DeviceState[0]} disabled/></span> Disabled 
            </div>
        </div> */}
        
    </div>
)

export default StatusInfoBar

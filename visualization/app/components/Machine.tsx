import { MachineContainer, CpuList, StorageList, CpuCore, TitleBox, StorageCore } from "./styledComp";
// 模拟CPU核心的状态
import cpuStates from "./State"


// 随机生成CPU核心状态，这个放在前端运行会产生bug，后台前台不一样
const getRandomCpuState = (): string => {
  return cpuStates[Math.floor(Math.random() * cpuStates.length)];
};
interface MachineProps { 
  machineId: number,
  coreState?: string[],
  coresDisabled?: boolean[]
  isLeader?: boolean
  leaderCore?: number[]
}

const Machine = ({ machineId, coreState, coresDisabled, isLeader, leaderCore }: MachineProps) => {
    return (
      <MachineContainer bordercolor={isLeader ? '#87CEEB' : "#ddd"}>
        <h3>Node {machineId + 1}</h3>
        <CpuList>
          <TitleBox>Cores:</TitleBox>
          <div style={{ display: "flex", justifyContent: "space-between", width: "90px" }}>
            {[...Array(4)].map((_, index) => (
              <CpuCore
                key={index}
                state={(coreState && coreState[index]) || getRandomCpuState()} 
                disabled={coresDisabled && coresDisabled[index]}
                bordercolor={isLeader && leaderCore && leaderCore[machineId] === index ? '#F7DC6F' : "transparent"}
              />
            ))}
          </div>
        </CpuList>
  
        {/* <StorageList>
          <TitleBox>Storages:</TitleBox>
          <div style={{ display: "flex", justifyContent: "space-between", width: "90px" }}>
            {[...Array(4)].map((_, index) => (
              <StorageCore
                key={index}
                state={(storageState && storageState[index]) || getRandomCpuState()}
                // disabled={coresDisabled && coresDisabled[index]}
              />
            ))}
          </div>
        </StorageList> */}
      </MachineContainer>
    );
};

export default Machine
  
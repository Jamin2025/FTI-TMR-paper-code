import { MachineContainer, CpuList, StorageList, CpuCore, TitleBox, StorageCore } from "./styledComp";
// 模拟CPU核心的状态
import cpuStates from "./State"


// 随机生成CPU核心状态，这个放在前端运行会产生bug，后台前台不一样
const getRandomCpuState = () => {
  return cpuStates[Math.floor(Math.random() * cpuStates.length)];
};

const Machine = ({ machineId }: { machineId: number }) => {
    return (
      <MachineContainer>
        <h3>Node {machineId}</h3>
        <CpuList>
          <TitleBox>Cores:</TitleBox>
          <div style={{ display: "flex", justifyContent: "space-between", width: "90px" }}>
            {[...Array(4)].map((_, index) => (
              <CpuCore key={index} state={getRandomCpuState()} />
            ))}
          </div>
        </CpuList>
  
        <StorageList>
          <TitleBox>Storages:</TitleBox>
          <div style={{ display: "flex", justifyContent: "space-between", width: "90px" }}>
            {[...Array(4)].map((_, index) => (
              <StorageCore key={index} state={getRandomCpuState()} />
            ))}
          </div>
        </StorageList>
      </MachineContainer>
    );
};

export default Machine
  
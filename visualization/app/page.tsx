"use client"
import ClusterDashboard from "./components/ClusterDashboard"
import TMRDashboard from "./components/TMR";
import TwoPhaseTMRDashboard from "./components/TwoPhaseTMR"
import StatusInfoBar from "./components/StatusInfoBar"
import ReactiveTMRDashboard from "./components/ReactiveTMR";
import DataSelector from "./components/DataSelection";
import { useMemo, useState } from "react";
import Task from "./alogrithms/Task";
import ExperimentCompare from './components/ExperimentCompare'

const DataTypes = ["random", 'robot', 'fpppp', 'sparse']

export default function Home() {
  const [selected, setSelected] = useState(DataTypes[1]);
  const [taskLen, setTaskLen] = useState('10')
  const [graphData, setGraphData] = useState(undefined)
  const isRandomData = selected === "random"
  const randomTask = useMemo(() => isRandomData ? new Array(+taskLen).fill(null).map((_, i) => {
    const task = new Task();
    task.id = i
    return task;
  }) : [], [taskLen, isRandomData])
  // const [excutedNumComp, setexcutedNumComp] = useState([])

  const [TMRexcutedNumsComp, setTMRExcutedNumsComp] = useState([])
  const [TPTMRexcutedNumsComp, setTPTMRexcutedNumsComp] = useState([])
  const [RTMRexcutedNumsComp, setRTMRexcutedNumsComp] = useState([])
  const [TPTDTMRDexcutedNumsComp, setTPTDTMRexcutedNumsComp] = useState([])

  const [TMRexcutedPofComp, setTMRExcutedPofComp] = useState([])
  const [TPTMRexcutedPofComp, setTPTMRexcutedPofComp] = useState([])
  const [RTMRexcutedPofComp, setRTMRexcutedPofComp] = useState([])
  const [TPTDTMRDexcutedPofComp, setTPTDTMRexcutedPofComp] = useState([])


  // 建立四个pof

  // 建立四个eachnode alg数据节点

  const taskNumExperimentData = useMemo(() => {
    const D: any[] = TMRexcutedNumsComp.concat(TPTMRexcutedNumsComp, RTMRexcutedNumsComp, TPTDTMRDexcutedNumsComp).sort((a, b) => a[0] - b[0])
    if (TPTDTMRDexcutedNumsComp.length > 1000) console.log(TPTDTMRDexcutedNumsComp[TPTDTMRDexcutedNumsComp.length - 1])
    console.warn = () => null
    D.unshift(["Orginal Tasks Num", "Excuted Tasks Num", "Method"])
    return D
  }, [TMRexcutedNumsComp, TPTMRexcutedNumsComp, RTMRexcutedNumsComp, TPTDTMRDexcutedNumsComp])

  const taskPofExperimentData = useMemo(() => {
    const D: any[] = TMRexcutedPofComp.concat(TPTMRexcutedPofComp, RTMRexcutedPofComp, TPTDTMRDexcutedPofComp).sort((a, b) => a[0] - b[0])
    D.unshift(["Orginal Tasks Num", "PoF", "Method"])
    return D
  }, [TMRexcutedPofComp, TPTMRexcutedPofComp, RTMRexcutedPofComp, TPTDTMRDexcutedPofComp])
 
  // 创建多个状态，最后合并一起，归并排序
  const AppBeTest = isRandomData ? randomTask  : graphData;
  return (
    <div className="">
      <DataSelector
        selected={selected}
        setSelected={setSelected}
        taskLen={taskLen}
        setTaskLen={setTaskLen}
        graphData={graphData}
        setGraphData={setGraphData}
        randomTask={randomTask}
      />
      <div className="pl-[10%] pt-20">
        <StatusInfoBar />
      </div>
      <TMRDashboard
        AppBeTest={AppBeTest}
        isRandomData={isRandomData}
        setTMRExcutedNumsComp={setTMRExcutedNumsComp}
        setTMRExcutedPofComp={setTMRExcutedPofComp}
      />
      <div className="border-t-2 border-gray-200 mt-10"></div>
      <TwoPhaseTMRDashboard
        AppBeTest={AppBeTest}
        isRandomData={isRandomData}
        setTPTMRexcutedNumsComp={setTPTMRexcutedNumsComp}
        setTPTMRexcutedPofComp={setTPTMRexcutedPofComp}
      />
      <div className="border-t-2 border-gray-200 mt-10"></div>
      <ReactiveTMRDashboard
        AppBeTest={AppBeTest}
        isRandomData={isRandomData}
        setRTMRexcutedNumsComp={setRTMRexcutedNumsComp}
        setRTMRexcutedPofComp={setRTMRexcutedPofComp}
      />
      <div className="border-t-2 border-gray-200 mt-10"></div>
      <ClusterDashboard
        AppBeTest={AppBeTest}
        isRandomData={isRandomData}
        setTPTDTMRexcutedNumsComp={setTPTDTMRexcutedNumsComp}
        setTPTDTMRexcutedPofComp={setTPTDTMRexcutedPofComp}
      />
      <div className="border-t-2 border-gray-200 mt-10"></div>
      <ExperimentCompare
        taskNumExperimentData={taskNumExperimentData}
        taskPofExperimentData={taskPofExperimentData}
      />
    </div>
  );
}

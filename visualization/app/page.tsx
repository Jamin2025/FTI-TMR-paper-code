"use client"
import ClusterDashboard from "./components/ClusterDashboard"
import TMRDashboard from "./components/TMR";
import TwoPhaseTMRDashboard from "./components/TwoPhaseTMR"
import StatusInfoBar from "./components/StatusInfoBar"
import ReactiveTMRDashboard from "./components/ReactiveTMR";
import DataSelector from "./components/DataSelection";
import { useEffect, useMemo, useState } from "react";
import Task from "./algorithms/Task";
import { MergeSort } from "./algorithms/util/mergeSort";
import ExperimentComparion from './components/ExperimentComparion'

const DataTypes = ["random", 'robot', 'fpppp', 'sparse']

// const mergeSort = new MergeSort((a : any, b: any) => a[0] < b[0]);

export default function Home() {
  const [selected, setSelected] = useState(DataTypes[1]);
  const [taskLen, setTaskLen] = useState('3')
  const isRandomData = selected === "random"
  const [graphApp, setGraphApp] = useState<any>([])
  // const [excutedNumComp, setexcutedNumComp] = useState([])

  const [TMRexcutedNumsComp, setTMRExcutedNumsComp] = useState([])
  const [TPTMRexcutedNumsComp, setTPTMRexcutedNumsComp] = useState([])
  const [RTMRexcutedNumsComp, setRTMRexcutedNumsComp] = useState([])
  const [TPTDTMRDexcutedNumsComp, setTPTDTMRexcutedNumsComp] = useState([])

  const [TMRexcutedPofComp, setTMRExcutedPofComp] = useState([])
  const [TPTMRexcutedPofComp, setTPTMRexcutedPofComp] = useState([])
  const [RTMRexcutedPofComp, setRTMRexcutedPofComp] = useState([])
  const [TPTDTMRDexcutedPofComp, setTPTDTMRexcutedPofComp] = useState([])


  const randomApp = useMemo(() => isRandomData ? new Array(+taskLen).fill(null).map((_, i) => {
    const task = new Task();
    task.id = i
    return task;
  }) : [], [taskLen, isRandomData])

  useEffect(() => {
    !isRandomData && import(`./algorithms/dataset/${selected}.json`).then((v) => {
      setGraphApp(v.default.map((item: any) => {
        const task = new Task(item.id, item.duration);
        return {...task, ...item};
      }))
    })
  }, [isRandomData, selected])
  // 建立四个pof
  // 建立四个eachnode alg数据节点

  const taskNumExperimentData = useMemo(() => {
    // const mergeSortedArrs = mergeSort.sortSortedArrs()
    const D: any[] = [["Number of Applications Executed", "Number of Tasks Executed", "Method"]].concat(TMRexcutedNumsComp, TPTMRexcutedNumsComp, RTMRexcutedNumsComp, TPTDTMRDexcutedNumsComp)
    return D
  }, [TMRexcutedNumsComp, TPTMRexcutedNumsComp, RTMRexcutedNumsComp, TPTDTMRDexcutedNumsComp])

  const taskPofExperimentData = useMemo(() => {
    // const mergeSortedArrs = mergeSort.sortSortedArrs(TMRexcutedPofComp, TPTMRexcutedPofComp, RTMRexcutedPofComp, TPTDTMRDexcutedPofComp)
    const D: any[] = [["Number of Applications Executed", "PoF", "Method"]].concat(TMRexcutedPofComp, TPTMRexcutedPofComp, RTMRexcutedPofComp, TPTDTMRDexcutedPofComp)
    return D
  }, [TMRexcutedPofComp, TPTMRexcutedPofComp, RTMRexcutedPofComp, TPTDTMRDexcutedPofComp])
  
  const AppBeTest = isRandomData ? randomApp  : graphApp;




  // console.log(taskNumExperimentData, taskPofExperimentData)
  return (
    <div className="">
      <DataSelector
        selected={selected}
        setSelected={setSelected}
        taskLen={taskLen}
        setTaskLen={setTaskLen}
        graphApp={graphApp}
        randomApp={randomApp}
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
      <ExperimentComparion
        taskNumExperimentData={taskNumExperimentData}
        taskPofExperimentData={taskPofExperimentData}
      />
    </div>
  );
}

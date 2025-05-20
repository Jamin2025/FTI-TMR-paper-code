"use client"
import React, { ChangeEvent, useEffect, useState } from "react";
import GraphVisiualization from "./GraphVisiual";
import Task from "../alogrithms/Task";
import { insetRandomData } from "../util/storeData";
const DataTypes = ["random", 'robot', 'fpppp', 'sparse']


const DataSelector = ({selected, setSelected, taskLen, setTaskLen, graphData, setGraphData, randomTask} : any) => {


  useEffect(() => {
    selected !== 'random' && import(`../alogrithms/dataset/${selected}.json`).then((v) => {
      setGraphData(v.default)
    })
  }, [selected])

  function handleTaskLen(e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (+v > 80) {
      window.alert("can't above 80")
      return
    }
    setTaskLen(v)
  }
  return (
    <div>
       <div className="p-6 max-w-md ml-[10%] pl-3">
      <label htmlFor="data-select" className="block mb-2 font-medium">
        Select Data Type:
      </label>
      <select
        id="data-select"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full p-2 border rounded"
      >
        {DataTypes.map(item => (
          <option key ={item} value={item}>{item}</option>
        ))}
      </select>
      {selected === 'random' && (
        <>
         <label htmlFor="task-len" className="block mb-2 mt-2 font-medium">
          TaskLen:
        </label>
        <input id="task-len" className="w-full p-2 border rounded" type="number" onChange={handleTaskLen} value={taskLen}/>
        {/* <button className="border border-gray-200 py-2 px-4 rounded mt-5">generate</button> */}
        </>
      )}
    
    </div>
      {selected !== 'random' &&  <GraphVisiualization graphData={graphData} amplife={selected=='robot'} />}
      {selected === 'random' &&  <RandomVisiualization randomTask={randomTask}/>}
    </div>
   
  );
};

const RandomVisiualization = ({randomTask}: {randomTask: any}) => {
  

  return (
    <div className="flex px-[10%] flex-wrap">
      {Array.isArray(randomTask) && randomTask.map((task) => (
        <div
          key={task.id}
          className="bg-white border rounded-2xl p-2 hover:scale-[1.02] my-5 ml-5 w-16 transition-transform"
        >
          <h3 className="text-base font-semibold text-gray-800 mb-1 text-center">T{task.id}</h3>
          <p className="text-gray-600 text-sm text-center">{task.duration.toFixed(2)}</p>
        </div>
      ))}
    </div>
  )
}

export default DataSelector;

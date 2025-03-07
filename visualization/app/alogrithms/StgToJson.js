const fs = require('fs').promises;

function StgToJson(file) {
  fs.readFile(
    file,
    'utf-8'
  ).then((data) => {
      const arr = data.split('\n').map(str => {
          return str.split(/\s+/g)
      })
      const nodeNum = Number(arr[0][1]) + 1
      const taskGraph = new Array(nodeNum).fill(null)
      const len = arr.length;
      for (let i = 1; i < len; i++) {
          const item = arr[i];
          if (item[0] == '#') break;
          insertInGraph(taskGraph, item)
      }
      // console.log(taskGraph)
      // console.log(topologicalSort(taskGraph, taskGraph.length))
  })
  // 邻接表
  function insertInGraph(taskGraph, item) {
      const id = Number(item[1])
      const duration = Number(item [2])
      const predecessornums = item[3]
      const predecessors = item.slice(4)
      taskGraph[id]={duration, complete: false, predecessors, predecessornums}
      const jsonData = JSON.stringify(taskGraph)
      fs.writeFile(file.replace("stg", "json"), jsonData)
  }
}

// StgToJson("./dataset/fpppp.stg")
// StgToJson("./dataset/robot.stg")
// StgToJson("./dataset/sparse.stg")

const taskGraph = JSON.parse(require('./dataset/fpppp.json'))
// 构建任务图的邻接表表示

// LJF调度算法
const LJFSchedule = () => {
  const readyQueue = []; // 初始化空的就绪队列

  while (true) {
      // 将没有前驱任务或前驱任务都已完成的任务加入就绪队列
      for (const taskId in taskGraph) {
          const task = taskGraph[taskId];
          if (task.predecessors.every(id => taskGraph[id].complete)) {
              readyQueue.push(task);
              taskGraph[id].complete = true;
          }
      }

      if (readyQueue.length === 0) {
          break; // 所有任务都已完成
      }

      // 选择剩余执行时间最长的任务作为当前任务
      readyQueue.sort((a, b) => b.duration - a.duration);
      const currentTask = readyQueue.shift();

      // 执行当前任务直到完成，并更新其剩余执行时间
      console.log(`执行任务 ${currentTask.id}`);

      // 更新任务状态，检查依赖关系，将新可执行任务加入就绪队列
      for (const taskId in taskGraph) {
          const task = taskGraph[taskId];
          task.predecessors = task.predecessors.filter(id => id !== currentTask.id);
      }
  }
};


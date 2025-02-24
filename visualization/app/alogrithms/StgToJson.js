const fs = require('fs').promises;

function StgToJson(file) {
  fs.readFile(
    file,
    'utf-8'
  ).then((data) => {
    const arr = data.split('\n').map(str => {
          return str.split(/\s+/g)
      })

      const taskGraph = new Array(Number(arr[0][1]) + 1).fill(0).map(() => [])
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
      predecessors.forEach((predecessor) => {
          taskGraph[predecessor].push({id, duration})
      })
      const jsonData = JSON.stringify(taskGraph)
      fs.writeFile(file.replace("stg", "json"), jsonData)
  }
}

StgToJson("./dataset/fpppp.stg")
StgToJson("./dataset/robot.stg")
StgToJson("./dataset/sparse.stg")



function scheduleLJF(graph) {
    const tasks = [];
    const scheduled = new Array(graph.length).fill(false);
  
    // 将任务添加到任务列表中
    for (let i = 0; i < graph.length; i++) {
      for (let j = 0; j < graph[i].length; j++) {
        const task = graph[i][j];
        tasks.push(task);
      }
    }
  
    // 按照任务长度排序
    tasks.sort((a, b) => b.duration - a.duration);
  
    // 调度任务
    const schedule = [];
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const node = task.id;
      if (!scheduled[node]) {
        scheduled[node] = true;
        schedule.push(node);
      }
    }
  
    return schedule;
}

/**
 * 
 * ```javascript
 * ```
 */
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
      taskGraph[id]={duration, complete: false, predecessors, predecessornums, id}
      const jsonData = JSON.stringify(taskGraph)
      fs.writeFile(file.replace("stg", "json"), jsonData)
  }
}

StgToJson("./dataset/fpppp.stg")
StgToJson("./dataset/robot.stg")
StgToJson("./dataset/sparse.stg")



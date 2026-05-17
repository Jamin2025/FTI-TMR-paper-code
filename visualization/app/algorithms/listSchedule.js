const taskGraph = require('./dataset/robot.json')
// 构建任务图的邻接表表示
const NodeTMR = require('./NodeTMR.js')

const node = new NodeTMR(0)

// LJF调度算法
const LJFSchedule = async () => {
  
  while (true) {
      // 将没有前驱任务或前驱任务都已完成的任务加入就绪队列
      const readyQueue = []; // 初始化空的就绪队列
      for (const taskId in taskGraph) {
          const task = taskGraph[taskId];
          if (!task.complete && task.predecessors.every(id => taskGraph[id].complete)) {
              readyQueue.push(task);
            //   taskGraph[id].complete = true;
          }
      }

      if (readyQueue.length === 0) {
          break; // 所有任务都已完成
      }

      // 选择剩余执行时间最长的任务作为当前任务
      readyQueue.sort((a, b) => b.duration - a.duration);
    //   const currentTask = readyQueue.shift();
    // console.log(readyQueue, readyQueue.length)
      await node.runWithTMR(readyQueue, (task, votRes) => {
         // 执行当前任务直到完成，并更新其剩余执行时间
        console.log(`执行任务 ${task.id}`);
        task.complete = true;
      })
     
  }
};

LJFSchedule()
// module.exports = LJFSchedule
// LJFSchedule()
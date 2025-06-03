
const { hitProbability } = require('./poisson.js')
const MaxHeap = require ("./util/heap.js").default
const coreNums = 4

function largerTaskOfDuration(a, b) {
    return a.duration > b.duration
}

class Core {
    isPermentFault = false;
    isCalculating = false;
    calCount = 0
    id = null
    scheduleMode = 'FCFS'
    active_ = true
    scheduleQueue = []
    scheduleHeap = new MaxHeap(largerTaskOfDuration)
    load = 0


    constructor(coreID, startExec, endExec) {
        this.id = coreID
        let that = this
        this.startExec = startExec
        this.endExec = endExec
    }
    // FCFS or LTF longest task first
    switchScheduleMode(mode) {
        this.scheduleMode = mode;
    }

    deactiveCore () {
        this.active_ = false
    }

    active() {
        this.active_ = true
    }

    promiseCalculate(task) {
        this.isCalculating = true;
        // 重写这里的代码，初始化的时候有两个钩子函数进行调用
        if (typeof this.startExec === "function") this.startExec(this.id)
        return new Promise((resolve) => {
            setTimeout(() => {
                if (this.isNormalOperate() && !hitProbability(task.transientFaultProbality)) task.result = 0.5
                else task.result = Math.random()
                this.isCalculating = false
                if (typeof this.endExec === "function") this.endExec(this.id, this.isPermentFault)
                resolve(task.result)
            }, 10)
            // task.duration * 
        })
    }

    auxFCFSCalculate() {
        if (this.scheduleQueue.length) {
            const task = this.scheduleQueue.shift();
            this.promiseCalculate(task).then((res) => {
                this.load -= task.duration
                this.auxFCFSCalculate();
                task.resolve(res)
            })
        }
    }

    auxLTFCalculate() {
        if (this.scheduleHeap.size) {
            const task = this.scheduleHeap.extractMax()
            this.promiseCalculate(task).then((res) => {
                this.load -= task.duration
                this.auxLTFCalculate();
                task.resolve(res)
            })
        }
    }

    calculate(task) {
        this.calCount++;
        return new Promise((resolve) => {
            this.load += task.duration
            task.resolve = resolve
            if (this.scheduleMode === 'FCFS') {
                this.scheduleQueue.push(task)
                !this.isCalculating && this.auxFCFSCalculate()
            } else {
                this.scheduleHeap.insert(task)
                !this.isCalculating && this.auxLTFCalculate()
            }
        })
    }

    isCalculating() {
        return this.isCalculating
    }
    isNormalOperate() {
        return !this.isPermentFault
    }
    broke() {
        this.isPermentFault = true
    }
}

module.exports = {
    Core,
    coreNums
}
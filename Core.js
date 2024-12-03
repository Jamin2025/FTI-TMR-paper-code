
const { hitProbability } = require('./poisson.js')
const coreNums = 4

class Core {
    isPermentFault = false;
    isCalculate = false;

    curCalculate = Promise.resolve();

    errorState() {
        this.isPermentFault = true;
    }

    calculate(task) {
        this.isCalculate = true;
        this.curCalculate = new Promise((resolve) => {
            setTimeout(() => {
                if (this.isNormalOperate() && !hitProbability(task.transientFaultProbality)) task.result = 'right'
                else task.result = 'wrong'
                resolve(task.result)
                this.isCalculate = false
            }, task.duration * 1000)
        })
        return this.curCalculate
    }

    isCalculating() {
        return this.isCalculate
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

const { hitProbability } = require('./poisson.js')
const { coreToBusyForTMR,
        coreRestoreForTMR,
        
        coreToBusyForTwoPhaseTMR,
        coreRestoreForTwoPhaseTMR,
        
        coreRestoreForReactiveTMR,
        coreToBusyForReactiveTMR,
        
        coreToBusyForClusterTMR, 
        coreRestoreForClusterTMR 
    } = require('../util/index')
const coreNums = 4

class Core {
    isPermentFault = false;
    isCalculate = false;
    calCount = 0
    NodeID = null
    id = null
    mode = null
    active_ = true
    constructor(id, mode, NodeID) {
        this.id = id
        this.mode = mode
        this.NodeID = NodeID
    }

    deactiveCore () {
        this.active_ = false
    }

    active() {
        this.active_ = true
    }

    curCalculate = Promise.resolve();

    errorState() {
        this.isPermentFault = true;
    }

    calculate(task) {
        this.calCount++;
        this.isCalculate = true;
        const isTMR = this.mode === 0
        const isTwoPhaseTMR = this.mode === 1
        const isReactiveTMR = this.mode === 2
        const isCluterTMR = this.mode === 3
        if (isTMR) coreToBusyForTMR(this.id)
        if (isTwoPhaseTMR) coreToBusyForTwoPhaseTMR(this.id)
        if (isReactiveTMR) {
            coreToBusyForReactiveTMR(this.id)
            if (!this.active_) console.info("try reactive")
        }
        if (isCluterTMR) coreToBusyForClusterTMR(this.id, this.NodeID)
        this.curCalculate = new Promise((resolve) => {
            setTimeout(() => {
                if (this.isNormalOperate() && !hitProbability(task.transientFaultProbality)) task.result = 0.5
                else task.result = Math.random()
                resolve(task.result)
                this.isCalculate = false
                if (isTMR) coreRestoreForTMR(this.id, this.isPermentFault)
                if (isTwoPhaseTMR) coreRestoreForTwoPhaseTMR(this.id, this.isPermentFault)
                if (isReactiveTMR) coreRestoreForReactiveTMR(this.id, this.isPermentFault)
                if (isCluterTMR) coreRestoreForClusterTMR(this.id, this.isPermentFault, this.NodeID)
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
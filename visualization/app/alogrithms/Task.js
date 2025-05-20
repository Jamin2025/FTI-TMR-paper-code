const { calProbability, hitProbability } = require('./poisson.js')
let idcount = 0
class Task {
    result
    id
    duration
    transientFaultProbality
    constructor() {
        this.id = idcount++
        this.duration = Math.random() * 2;
        this.transientFaultProbality = calProbability(this.duration) + 0.05
        // console.log(this.transientFaultProbality)
    }
}

module.exports = Task

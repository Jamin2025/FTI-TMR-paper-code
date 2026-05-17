const { calProbability } = require('./poisson.js')
let idcount = 0
class Task {
    result
    id
    duration
    transientFaultProbality
    constructor(id, duration) {
        if (id != null && duration != null) {
            this.id = id;
            this.duration = duration
            this.transientFaultProbality = calProbability(this.duration)
            // console.log(this.transientFaultProbality)
        } else {
            this.id = idcount++
            this.duration = Math.random() * 10;
            this.transientFaultProbality = calProbability(this.duration)
        }
    }
}

module.exports = Task

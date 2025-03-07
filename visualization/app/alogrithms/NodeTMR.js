const Node_ = require('./Node_')


class NodeTMR extends Node_ {
    constructor() {
        super()
        this.cores = new Array(coreNums).fill(null).map(() => new Core())
    }
}
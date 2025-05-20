const { coreNums, Core } = require('./Core')
class Node {
    cores = new Array(coreNums)

    brokeCore(id) {
        this.cores[id].broke()
    }

    NodeID = null

    // mode 0 TMR, 1 TwoPhase TMR, 2 ReactiveTMR, 3 DashBoard
    constructor(mode, id) {
        const { cores } = this
        this.NodeID = id
        for (let i = 0; i < coreNums; i++) {
            cores[i] = new Core(i, mode, this.NodeID)
        }
        
    }
    async runOnDistinctFreeCores(num, exclude, task) {
        let i = 0
        const hasExclude = exclude instanceof Set
        if (hasExclude && exclude.size === 4) throw new Error("runOnDistinctFreeCores error");
        if (hasExclude && coreNums - exclude.size < num) return Promise.reject("no more distinct core")
        const freeCoresAndCalArr = await new Promise(async (resolve, reject) => {
            let freeCores = []
            let callArr = []
            const searchs = []
            for (let j = 0; j < 4; j++) {
                // 排除掉的内核
                if (hasExclude && exclude.has(j)) continue
                searchs.push(this.cores[j].curCalculate.then(() => {
                    if (i < num) {
                        ++i
                        callArr.push(this.cores[j].calculate(task))
                        freeCores.push(j)
                        if (i === num) resolve({ freeCores, callArr })
                    }
                    return null
                })
            )
            }
            Promise.all(searchs).then(() => {
                if (i < num) reject("no more distinct core")
            })
        })
        return freeCoresAndCalArr
    }

    async executeTask(task) {
        return new Promise((resolve) => {
            let isCalculated = false
            for (let i = 0; i < 4; i++) {
                this.cores[i].curCalculate.then(() => {
                    if (isCalculated) return null
                    isCalculated = true
                    resolve([this.cores[i].calculate(task), i])
                })
            }
        })
    }

    getTaskRunCount() {
        const count = this.cores.reduce((a, b) => {
            return a + b.calCount
        }, 0)
        return count
    }
    static FT = {
        TMR_with_fault_core(a, b, c, cores) {
            if (a == b) return [a, cores[2]];
            if (a == c) return [c, cores[1]];
            if (b == c) return [b, cores[0]];
            // console.log('TMR_with_fault_core error Majority Voting can\'nt determine the result', a, b, c)
            return [0, cores];
        },
    
        TMR(a, b, c){
            if (a == b) return a;
            if (a == c) return c;
            if (b == c) return b;
            // console.log('TMR error Majority Voting can\'t determine the result', a, b, c)
            return 0;
        },
    
        TPTMR_Primary(a, b) {
            if (a == b) return a;
            return 'TPTMPnoPass';
        }
    }
    
}
module.exports = Node

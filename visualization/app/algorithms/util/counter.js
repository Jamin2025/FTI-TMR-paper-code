class Counter {
    constructor() {
        this.count = 0;
    }

    increase() {
        this.count++;
    }

    decrease() {
        this.count--;
    }

    reset()  {
        this.count = 0;
    }

    getCount() {
        return this.count
    }
    
}

module.exports = Counter
class ExponentialBackoff{
    currentTurn = 0;
    idMapEnterTurn = new Map();
    idMapFailedNum = new Map();

    increaseTurn() {
        this.currentTurn++;
    }

    enter(id) {
        this.idMapEnterTurn.set(id, this.currentTurn);
        this.idMapFailedNum.set(id, 1);
    }

    hitTurn(id) {
        if (this.idMapEnterTurn.has(id)) {
            const enterTurn = this.idMapEnterTurn.get(id);
            const failedCount = this.idMapFailedNum.get(id);
            if (this.currentTurn >= enterTurn + failedCount ** 2) {
                this.idMapEnterTurn.delete(id);
                this.idMapFailedNum.delete(id);
                return true; // Hit the turn
            }
            return false; // Not hit the turn yet
        }
        return false; // ID not found
    }

    failed(id) {
        if (this.idMapFailedNum.has(id)) {
            const failedCount = this.idMapFailedNum.get(id) + 1;
            this.idMapFailedNum.set(id, failedCount);
        } else {
            this.idMapFailedNum.set(id, 1);
        }
    }

    success(id) {
        this.idMapFailedNum.delete(id);
        this.idMapEnterTurn.delete(id);
    }

}

export default ExponentialBackoff;
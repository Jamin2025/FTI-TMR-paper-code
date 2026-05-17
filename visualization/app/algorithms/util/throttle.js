// 会保存最后一次更新到时间点执行。
function throttle(fun, delay = 1000) {
    let isThrottled = false;
    let savedArgs = null;
    let savedThis = null;
    let hasSavedFun = false;
    
    function wrapper(...args) {
        if (isThrottled) {
            savedArgs = args;
            savedThis = this;
            hasSavedFun = true
            return;
        }
    
        fun.apply(this, args);
        isThrottled = true;
    
        setTimeout(() => {
            isThrottled = false;
            if (hasSavedFun) {
                wrapper.apply(savedThis, savedArgs);
                savedArgs = null;
                savedThis = null;
                hasSavedFun = false
            }
        }, delay);
    }
    
    return wrapper;
}

module.exports = throttle
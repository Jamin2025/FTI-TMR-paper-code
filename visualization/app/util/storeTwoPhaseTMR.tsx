import { insertInMethod, callMethod } from "./store"
export function insetCoreStateForTwoPhaseTMR(method: any) {
    insertInMethod("setCoreStateForTwoPhaseTMR", method)
}

export function coreToBusyForTwoPhaseTMR(id: number) {
    callMethod('setCoreStateForTwoPhaseTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        newCoreState[id] = "Busy"
        return newCoreState
    })
}

export function coreRestoreForTwoPhaseTMR(id: number, isPermentFault: boolean) {
    callMethod('setCoreStateForTwoPhaseTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        // console.log(this.isPermentFault)
        newCoreState[id] = isPermentFault ? "Broke" : "Idel"
        return newCoreState
    })
}



export function insetStorageStateForTwoPhaseTMR(method: any) {
    insertInMethod("setStorageStateForTwoPhaseTMR", method)
}

export function insetExperimentStateForTwoPhaseTMR(method: any) {
    insertInMethod("setExperimentStateForTwoPhaseTMR", method)
}

export function setExperimentStateForTwoPhaseTMR(fun: any) {
    callMethod("setExperimentStateForTwoPhaseTMR", fun)
}
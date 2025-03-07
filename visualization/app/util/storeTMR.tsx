import { insertInMethod, callMethod } from "./store"
export function insetCoreStateForTMR(method: any) {
    insertInMethod("setCoreStateForTMR", method)
}

export function coreToBusyForTMR(id: number) {
    callMethod('setCoreStateForTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        newCoreState[id] = "Busy"
        return newCoreState
    })
}

export function coreRestoreForTMR(id: number, isPermentFault: boolean) {
    callMethod('setCoreStateForTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        // console.log(this.isPermentFault)
        newCoreState[id] = isPermentFault ? "Broke" : "Idel"
        return newCoreState
    })
}



export function insetStorageStateForTMR(method: any) {
    insertInMethod("setStorageStateForTMR", method)
}

export function insetExperimentStateForTMR(method: any) {
    insertInMethod("setExperimentStateForTMR", method)
}

export function setExperimentStateForTMR(fun: any) {
    callMethod("setExperimentStateForTMR", fun)
}
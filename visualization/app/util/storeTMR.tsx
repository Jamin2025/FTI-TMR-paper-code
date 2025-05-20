import { insertInMethod, callMethod } from "./store"
export function insetCoreStateForTMR(method: any) {
    insertInMethod("setCoreStateForTMR", method)
}

export function coreToBusyForTMR(id: number, NodeId: number) {
    callMethod('setCoreStateForTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        const cores = [...newCoreState[NodeId]]
        cores[id] = "Busy"
        // console.log(this.isPermentFault)
        newCoreState[NodeId] = cores
        return newCoreState
    })
}

export function coreRestoreForTMR(id: number, isPermentFault: boolean, NodeId: number) {
    callMethod('setCoreStateForTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        const cores = [...newCoreState[NodeId]]
        cores[id] = isPermentFault ? "Broke" : "Idel"
        // console.log(this.isPermentFault)
        newCoreState[NodeId] = cores
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
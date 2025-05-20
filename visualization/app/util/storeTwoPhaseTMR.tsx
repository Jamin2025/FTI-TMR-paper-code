import { insertInMethod, callMethod } from "./store"
export function insetCoreStateForTwoPhaseTMR(method: any) {
    insertInMethod("setCoreStateForTwoPhaseTMR", method)
}

export function coreToBusyForTwoPhaseTMR(id: number, NodeId: number) {
    callMethod('setCoreStateForTwoPhaseTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        const cores = [...newCoreState[NodeId]]
        cores[id] = "Busy"
        // console.log(this.isPermentFault)
        newCoreState[NodeId] = cores
        return newCoreState
    })
}

export function coreRestoreForTwoPhaseTMR(id: number, isPermentFault: boolean, NodeId: number) {
    callMethod('setCoreStateForTwoPhaseTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        const cores = [...newCoreState[NodeId]]
        cores[id] = isPermentFault ? "Broke" : "Idel"
        // console.log(this.isPermentFault)
        newCoreState[NodeId] = cores
        return newCoreState
    })
}


export function insetExperimentStateForTwoPhaseTMR(method: any) {
    insertInMethod("setExperimentStateForTwoPhaseTMR", method)
}

export function setExperimentStateForTwoPhaseTMR(fun: any) {
    callMethod("setExperimentStateForTwoPhaseTMR", fun)
}


import { insertInMethod, callMethod } from "./store"
export function insetCoreStateForClusterTMR(method: any) {
    insertInMethod("setCoreStateForClusterTMR", method)
}

export function coreToBusyForClusterTMR(id: number, NodeId: number) {
    callMethod('setCoreStateForClusterTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        newCoreState[NodeId][id] = "Busy"
        return newCoreState
    })
}

export function coreRestoreForClusterTMR(id: number, isPermentFault: boolean, NodeId: number) {
    callMethod('setCoreStateForClusterTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        console.log(NodeId, id, isPermentFault)
        newCoreState[NodeId][id] = isPermentFault ? "Broke" : "Idel"
        return newCoreState
    })
}



export function insetStorageStateForClusterTMR(method: any) {
    insertInMethod("setStorageStateForClusterTMR", method)
}

export function insetExperimentStateForClusterTMR(method: any) {
    insertInMethod("setExperimentStateForClusterTMR", method)
}

export function setExperimentStateForClusterTMR(fun: any) {
    callMethod("setExperimentStateForClusterTMR", fun)
}

export function setSTForClusterTMR(fun: any) {
    callMethod("setSTForClusterTMR", fun)
}

export function insetSTForClusterTMR(method: any) {
    insertInMethod("setSTForClusterTMR", method)
}

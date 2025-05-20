

import { insertInMethod, callMethod } from "./store"
export function insetCoreStateForClusterTMR(method: any) {
    insertInMethod("setCoreStateForClusterTMR", method)
}

export function coreToBusyForClusterTMR(id: number, NodeId: number) {
    callMethod('setCoreStateForClusterTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        const cores = [...newCoreState[NodeId]]
        cores[id] = "Busy"
        // console.log(this.isPermentFault)
        newCoreState[NodeId] = cores
        return newCoreState
    })
}

export function coreRestoreForClusterTMR(id: number, isPermentFault: boolean, NodeId: number) {
    callMethod('setCoreStateForClusterTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        const cores = [...newCoreState[NodeId]]
        cores[id] = isPermentFault ? "Broke" : "Idel"
        // console.log(this.isPermentFault)
        newCoreState[NodeId] = cores
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

export function setLeaderForClusterTMR(fun: any) {
    callMethod("setLeaderForClusterTMR", fun)
}

export function insetLeaderForClusterTMR(method: any) {
    insertInMethod("setLeaderForClusterTMR", method)
}


export function insetCoresDisabledForClusterTMR(method: any) {
    insertInMethod("setCoresDisabledForClusterTMR", method)
}

export function deactiveCoresForClusterTMR(NodeID: number, id: number) {
    callMethod('setCoresDisabledForClusterTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        newCoreState[NodeID][id] = true
        return newCoreState
    })
}

export function activeCoresForClusterTMR(NodeID: number, id: number) {
    callMethod('setCoresDisabledForClusterTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        newCoreState[NodeID][id] = false
        return newCoreState
    })
}

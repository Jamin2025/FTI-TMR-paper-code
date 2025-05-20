import { insertInMethod, callMethod } from "./store"
export function insetCoreStateForReactiveTMR(method: any) {
    insertInMethod("setCoreStateForReactiveTMR", method)
}

export function coreToBusyForReactiveTMR(id: number, NodeId: number) {
    callMethod('setCoreStateForReactiveTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        const cores = [...newCoreState[NodeId]]
        cores[id] = "Busy"
        // console.log(this.isPermentFault)
        newCoreState[NodeId] = cores
        return newCoreState
    })
}

export function coreRestoreForReactiveTMR(id: number, isPermentFault: boolean, NodeId: number) {
    callMethod('setCoreStateForReactiveTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        const cores = [...newCoreState[NodeId]]
        cores[id] = isPermentFault ? "Broke" : "Idel"
        // console.log(this.isPermentFault)
        newCoreState[NodeId] = cores
        return newCoreState
    })
}



export function insetStorageStateForReactiveTMR(method: any) {
    insertInMethod("setStorageStateForReactiveTMR", method)
}

export function insetExperimentStateForReactiveTMR(method: any) {
    insertInMethod("setExperimentStateForReactiveTMR", method)
}

export function setExperimentStateForReactiveTMR(fun: any) {
    callMethod("setExperimentStateForReactiveTMR", fun)
}

export function insetCoresDisabledForReactiveTMR(method: any) {
    insertInMethod("setCoresDisabledForReactiveTMR", method)
}

export function deactiveCoresForReactiveTMR(id: number, NodeId: number) {
    callMethod('setCoresDisabledForReactiveTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        newCoreState[NodeId][id] = true
        return newCoreState
    })
}

export function activeCoresForReactiveTMR(id: number, NodeId: number) {
    callMethod('setCoresDisabledForReactiveTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        newCoreState[NodeId][id] = false
        return newCoreState
    })
}

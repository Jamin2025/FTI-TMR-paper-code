import { insertInMethod, callMethod } from "./store"
export function insetCoreStateForReactiveTMR(method: any) {
    insertInMethod("setCoreStateForReactiveTMR", method)
}

export function coreToBusyForReactiveTMR(id: number) {
    callMethod('setCoreStateForReactiveTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        newCoreState[id] = "Busy"
        return newCoreState
    })
}

export function coreRestoreForReactiveTMR(id: number, isPermentFault: boolean) {
    callMethod('setCoreStateForReactiveTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        // console.log(this.isPermentFault)
        newCoreState[id] = isPermentFault ? "Broke" : "Idel"
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

export function deactiveCoresForReactiveTMR(id: number) {
    callMethod('setCoresDisabledForReactiveTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        newCoreState[id] = true
        return newCoreState
    })
}

export function activeCoresForReactiveTMR(id: number) {
    callMethod('setCoresDisabledForReactiveTMR', (prevCoreState: any) => {
        const newCoreState = [...prevCoreState]
        newCoreState[id] = false
        return newCoreState
    })
}

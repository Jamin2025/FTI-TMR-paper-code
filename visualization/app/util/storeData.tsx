import { insertInMethod, callMethod } from "./store"

export function callSetRandomData(data: any) {
    callMethod('setRandomData', data)
}



export function insetRandomData(method: any) {
    insertInMethod("setRandomData", method)
}

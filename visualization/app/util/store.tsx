export type StorageMethod = { [key: string]: (...args: any) => any }

const storageMethod: StorageMethod  = {}

export function insertInMethod(key: string, value: (...args: any) => any) {
    storageMethod[key] = value
}

export function callMethod(key: string, ...param: any) {
    if (key in storageMethod) storageMethod[key](...param);
}


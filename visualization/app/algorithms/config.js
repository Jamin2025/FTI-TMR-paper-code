export const coreNums = 4

// 每个任务执行多少轮次
export const Turn = 100

export const updateExperimentFrequency = 20
export const InitialCoreState = [
    
    ['Idel', 'Idel', 'Idel', 'Idel'],
    ['Broke', 'Broke', 'Broke', 'Idel'],
    ['Idel', 'Idel', 'Idel', 'Idel'],
    ['Idel', 'Idel', 'Broke', 'Idel'],
    ['Idel', 'Idel', 'Idel', 'Idel'],
    ['Broke', 'Broke', 'Broke', 'Broke'],
    ['Idel', 'Idel', 'Idel', 'Idel'],
    ['Idel', 'Broke', 'Broke', 'Idel'],
    ['Idel', 'Idel', 'Idel', 'Idel'],
]

// export const InitialCoreState = [
    
//     ['Idel', 'Idel', 'Idel', 'Idel'],
//     ['Idel', 'Idel', 'Idel', 'Idel'],
//     ['Idel', 'Idel', 'Idel', 'Idel'],
//     ['Idel', 'Idel', 'Idel', 'Idel'],
//     ['Idel', 'Idel', 'Idel', 'Idel'],
//     ['Idel', 'Idel', 'Idel', 'Idel'],
//     ['Idel', 'Idel', 'Idel', 'Idel'],
//     ['Idel', 'Idel', 'Idel', 'Idel'],
//     ['Idel', 'Idel', 'Idel', 'Idel'],
    
// ]


// export const InitialCoreState = [
//     ['Idel', 'Idel', 'Idel', 'Idel'],
// ]

// export const ClusterNumber = 1;

export const ClusterNumber = 9;

const durations = [0, "real", 50]
export const excuteDuration = durations[0]
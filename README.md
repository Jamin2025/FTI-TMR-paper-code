# 容错paper实验

## TODO
- [x] 测试单内核永久性错误api
- [x] 实现R-TMR
    - [x] sideList reactive core
    - [x] exponential backoff
    - [x] 调整任务计算逻辑，调整任务来自标准任务集
    - [ ] 调整调度算法为list调度 longest task first
- [ ] 比较R-TMR TMR TWOPHASE-TMR（30号）
    - [x] 任务执行数
    - [x] probability of failure
- [ ] 统计数据
    - [x] 每个算法五个机器跑
    - [ ] pof
    - [x] excute task Nums
    - [ ] each machine with data compare
- [ ] 写论文
- [x] 可视化 next.js
- [x] 可视化随机数据
- [ ] 调整st值位置, L, T等位置
- [x] 降低算法执行任务数
    - [x] broken core识别
    - [ ] 可选：指数增长的范围
    - [x] 瞬时故障概率
    - [x] 增加执行周期长度

思考：

数据传输可能会出现问题，存储单元损坏会直接无法访问，给的数据错了，计算也是错的，多机比较没有意义。可以定期查数据传输问题。需要了解cpu数据传输具体流程
这个为I/O流程，mmio内存地址当作register，polling轮询询问设备有无数据，中断，中断设备告知数据。
DMA,CPU也参与。

如果一个传感器传递数据给cpu的过程中出了错，这个多机怎么识别？那只关心计算错误。


每个核心有一个单独的进程进行监听，测试该核心数据流转能力（周期跨度长）。测试该核心计算能力。 n


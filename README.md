# 容错paper实验

## TODO
- [x] 测试单内核永久性错误api
- [x] 实现R-TMR
    - [x] sideList reactive core
    - [x] exponential backoff
    - [x] 调整任务计算逻辑，调整任务来自标准任务集
    - [ ] 调整调度算法为list调度 longest task first
- [x] 模拟能源消耗计算
    - [x] 主要相同任务为执行任务的次数
    - [ ] 其他比较开销，迁移等
- [ ] 比较R-TMR TMR TWOPHASE-TMR（30号）
    - [x] 任务执行数
    - [x] probability of failure
    
- [ ] 梳理自己算法如何写成代码，同时写论文，和实验同步进行
    - [ ] 分布式论文查看
    - [ ] 能源消耗为计算平均程度
    - [ ] 单多核心错误比较
- [ ] 展示rc-tmr多核心错误容忍能力。
    - [ ] 不能进行时拉起投票检错过程。
- [ ] 可视化 next.js，在比较阶段进行


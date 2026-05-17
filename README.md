# FTI-TMR Code Base


## 如何跑起来 How to run?
装上docker后

After installed docker
```shell 
docker build -t node-slim:20 .
docker run -it -v $(pwd):/usr/src/app -p 3000:3000 --rm --name  FTPaper-project-env node-slim:20
```

## 实验结果数据 The experiment data
```shell
# 在以下目录
# Inside the following directory
./results/**
```
你可以自己配置以下文件后自己尝试跑一下实验

And also you can modify config file bellow to try a experiment youself


```
./visulaization/app/algorithms/config.js
```

## 实验开发过程

## TODO
- [x] 测试单内核永久性错误api
- [x] 实现R-TMR
    - [x] sideList reactive core
    - [x] exponential backoff
    - [x] 调整任务计算逻辑，调整任务来自标准任务集
    - [x] 调整调度算法为list调度 longest task first
- [x] 比较R-TMR TMR TWOPHASE-TMR（30号）
    - [x] 任务执行数
    - [x] probability of failure
- [x] 统计数据
    - [x] 每个算法五个机器跑
    - [x] pof
    - [x] excute task Nums
- [x] 写论文
- [x] 可视化 next.js
- [x] 可视化随机数据
- [ ] 调整st值位置, L, T等位置
- [x] 降低算法执行任务数
    - [x] broken core识别
    - [ ] 可选：指数增长的范围
    - [x] 瞬时故障概率
    - [x] 增加执行周期长度




## 写论文时刻的TODO
1. [x] 论文中的周期渐进增长。
2. [x] 完全损坏的机器是否让其一直运行？代码中的逻辑修改。
3. [x] 完善图表及介绍，修改第一个有限状态机图。完善前面的论文内容
4. [x] 设置4个坏机器，5个好机器。论文已完成，代码也要加上。实验里面的ss值计算
5. [x] 完善结论。
6. [x] 转发ssi加入di si计算验证
7. [x] 调整图顺序，加入心跳机制以。
8. [x] 加入调度策略，改两张图，

1. [x] 加入raft
- [x] 摘要修改比较对象
- [x] Core关闭的定义，对应用的调度分配权，坏core的调度会被拒绝。领导会通知好core进行调度。
- [x] 大顶堆投票问题 SS + i
- [x] 投票过程中的任务数计算说明是否要加入进去。(修改实验，论文等返回再说，图标需要修改)
- [x] 翻译成英文.
- [x] 机器节点名词混用,用节点
- [x] 重计算任务数，投票检查等阶段的额外消耗
- [x] 数据修改合并。并说明0.11 = 1/9
- [x] 再查一下pdf图
- [x] 总结nv，np
- [x] 添加参考文献，思考怎么添加比较合适（从上到下逐步添加？）
- [x] 添加一些分布式理论方法的介绍。
- [x] 更改图，再计算一下额外task改一下数据。


## 论文step by step TODO 5天
1. [x] 4号完成背景，
2. [x] 5号 规划好英文简写 完成对方法的修改 。
3. [x] 6号，更改实验结果的显示，收集数据，实验 写结论， 修改完善引言和摘要,
# FTI-TMR Code Base

## Paper
https://arxiv.org/abs/2510.16896

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

## 问题解答
如果你在运行中遇到任何困难，请给我提issue。
If you have any problem, please file an issue

# The MIT License (MIT)
Copyright © 2026 <copyright holders>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
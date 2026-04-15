# Dockerfile
FROM node:20-slim

# 设置工作目录
WORKDIR /usr/src/app/visualization

# 复制源代码到容器中
COPY . ../

RUN npm config set registry https://registry.npmmirror.com && \
    npm install
# 验证npm版本


# 设置容器的默认命令
CMD ["sh", "-c", "npm run dev"]
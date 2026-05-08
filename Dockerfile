# 使用官方 Node.js 镜像
FROM node:20-bullseye

# 设置工作目录
WORKDIR /app

# 复制前端和后端代码
COPY frontend ./frontend
COPY backend ./backend

# 构建前端
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# 安装后端依赖
WORKDIR /app/backend
RUN npm install

# 复制前端构建文件到后端可访问目录
RUN cp -r /app/frontend/dist ./frontend-dist

# 设置环境变量端口
ENV PORT=3000

# 启动后端
CMD ["node", "index.js"]
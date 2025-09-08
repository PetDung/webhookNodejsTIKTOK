# Dockerfile
# 1. Chọn Node.js 20
FROM node:20-alpine

# 2. Tạo folder app
WORKDIR /usr/src/app

# 3. Copy package.json + package-lock.json
COPY package*.json ./

# 4. Cài dependencies
RUN npm install --production

# 5. Copy toàn bộ source code
COPY . .

# 6. Expose cổng 3005
EXPOSE 3005

# 7. Chạy server
CMD ["node", "server.js"]

# ============================================================
# Stage 1: Build — dùng Node.js để build Vite/React app
# ============================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files trước để cache layer
COPY package.json package-lock.json ./

# Cài dependencies
RUN npm ci

# Copy toàn bộ source
COPY . .

# Build arg để nhận API URL lúc build (truyền từ ECS Task / CI/CD)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build production bundle
RUN npm run build

# ============================================================
# Stage 2: Serve — dùng Nginx Alpine (siêu nhẹ ~25MB)
# ============================================================
FROM nginx:1.27-alpine AS final

# Xóa config mặc định của Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy cấu hình Nginx tuỳ chỉnh (hỗ trợ React Router SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output từ stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx lắng nghe port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

# =========================
# Stage 1 – Build
# =========================
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build && rm -rf .next/cache


# =========================
# Stage 2 – Production
# =========================
FROM node:20-alpine AS production
WORKDIR /app

# 👉 Không cần cài node_modules ở đây nữa!

# Chỉ copy output standalone, static và public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Nếu có env thì copy thêm
# COPY --from=builder /app/.env.production .env.local

USER node
EXPOSE 3000
CMD ["node", "server.js"]

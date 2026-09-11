# syntax=docker/dockerfile:1

# --- deps/dev stage: для локального dev через docker compose ---
FROM oven/bun:1.4-alpine AS dev
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
EXPOSE 5173
CMD ["bun", "run", "dev", "--host"]

# --- builder stage: сборка статики ---
FROM oven/bun:1.4-alpine AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# --- production stage: nginx отдаёт статику SPA ---
# Бандл собран, дальше рантайм не нужен: прод-образ несёт только файлы и nginx.
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/40-env-config.sh /docker-entrypoint.d/40-env-config.sh
RUN chmod +x /docker-entrypoint.d/40-env-config.sh
EXPOSE 80

# syntax=docker/dockerfile:1

# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# EXPO_PUBLIC_API_URL is baked into the JS bundle at build time.
# Default /api works same-origin in any Docker Compose where this nginx
# proxies /api/ to the backend service. Override for production if needed:
#   docker build --build-arg EXPO_PUBLIC_API_URL=https://main.wedapp.gr/api
ARG EXPO_PUBLIC_API_URL=/api
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}

RUN npx expo export --platform web

# ── Serve stage ───────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

RUN rm -f /etc/nginx/conf.d/default.conf

COPY docker/nginx.proxy.conf /etc/nginx/conf.d/default.conf
COPY docker/docker-entrypoint.d/60-wedmain-config.sh /docker-entrypoint.d/60-wedmain-config.sh
RUN chmod +x /docker-entrypoint.d/60-wedmain-config.sh

COPY --from=builder /app/dist /usr/share/nginx/html/

EXPOSE 80

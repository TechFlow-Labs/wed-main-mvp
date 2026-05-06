# syntax=docker/dockerfile:1

# ── Build stage: export Expo web bundle ──────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# EXPO_PUBLIC_* vars must be available at BUILD TIME — they are baked into
# the JS bundle. Pass them as Docker build args in Coolify.
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_SUPABASE_URL
ARG EXPO_PUBLIC_SUPABASE_ANON_KEY
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}
ENV EXPO_PUBLIC_SUPABASE_URL=${EXPO_PUBLIC_SUPABASE_URL}
ENV EXPO_PUBLIC_SUPABASE_ANON_KEY=${EXPO_PUBLIC_SUPABASE_ANON_KEY}

RUN npx expo export --platform web

# ── Serve stage: lightweight nginx static file server ────────────────────────
FROM nginx:1.27-alpine
COPY docker/nginx.static.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

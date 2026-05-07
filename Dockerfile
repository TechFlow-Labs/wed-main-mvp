FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Web bundle uses same-origin /api so Nginx can proxy to the API (no browser CORS to :8060).
ARG EXPO_PUBLIC_API_URL=/api
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
RUN npm run build:web

FROM nginx:1.27-alpine

ENV APP_DOMAIN=_
ENV API_UPSTREAM=http://host.docker.internal:8060

# Official nginx entrypoint expands /etc/nginx/templates/*.template with envsubst.
COPY docker/nginx.http.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# COPY can preserve tight perms from host; nginx runs as non-root.
RUN chmod -R a+rX /usr/share/nginx/html

EXPOSE 85

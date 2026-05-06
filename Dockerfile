FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Web bundle uses same-origin /api so Traefik routes API traffic to backend (no browser CORS to host ports).
ARG EXPO_PUBLIC_API_URL=/api
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
RUN npm run build:web

FROM node:20-alpine

WORKDIR /app
RUN npm install -g serve@14.2.4

COPY --from=builder /app/dist ./dist
RUN chmod -R a+rX /app/dist

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]

FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx expo export --platform web

FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm install --global serve@14.2.4

ENV NODE_ENV=production
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]

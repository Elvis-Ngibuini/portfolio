FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++ wget
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm rebuild bcrypt --update-binary && \
    npm cache clean --force && \
    mkdir -p /app/storage /app/uploads
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3001/health || exit 1
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
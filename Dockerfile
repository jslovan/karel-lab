# Multi-stage Docker build for ultra-small production image

# Stage 1: Build & Compile
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Minimal Runtime Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/karel.pl ./src/karel.pl

EXPOSE 3000

CMD ["npm", "start"]

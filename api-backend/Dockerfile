FROM node:20-alpine AS builder

WORKDIR /app

COPY api-backend/package.json api-backend/package-lock.json ./
RUN npm ci

COPY api-backend/tsconfig.json ./
COPY api-backend/src ./src

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY api-backend/package.json api-backend/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/server.js"]

FROM node:20-alpine AS builder

WORKDIR /app

COPY intranet/package.json intranet/package-lock.json ./
RUN npm ci

COPY intranet/next.config.ts intranet/tsconfig.json intranet/postcss.config.mjs ./
COPY intranet/public ./public
COPY intranet/app ./app
COPY intranet/components ./components
COPY intranet/lib ./lib
COPY intranet/features ./features
COPY intranet/data ./data
COPY intranet/middleware.ts ./middleware.ts
COPY intranet/eslint.config.mjs ./eslint.config.mjs

ARG API_BACKEND_URL=http://localhost:4000
ENV API_BACKEND_URL=$API_BACKEND_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

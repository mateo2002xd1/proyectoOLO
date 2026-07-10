FROM node:20-alpine AS builder

WORKDIR /app

COPY packages/blocks-renderer ./packages/blocks-renderer

COPY sitio-web/package.json sitio-web/package-lock.json ./
RUN npm ci

COPY sitio-web/next.config.mjs sitio-web/jsconfig.json sitio-web/tsconfig.json sitio-web/next-env.d.ts ./
COPY sitio-web/postcss.config.mjs ./
COPY sitio-web/public ./public
COPY sitio-web/src ./src

ARG BACKEND_URL=http://localhost:4000
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG JWT_SECRET=dev-secret-change-me
ENV BACKEND_URL=$BACKEND_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV JWT_SECRET=$JWT_SECRET
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

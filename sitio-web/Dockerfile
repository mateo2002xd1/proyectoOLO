# Imagen del sitio web.
#
# El contexto de build es la RAIZ del repositorio (ver `context: .` en los
# docker-compose): hacen falta tanto `sitio-web/` como `packages/`.
FROM node:20-alpine AS builder

WORKDIR /app

# Los paquetes compartidos, los siete, en /packages y NO en /app/packages.
#
# Dos cosas estaban mal aqui. Se copiaba uno solo de los siete que declara el
# package.json (`blocks-renderer`), y se copiaba a /app/packages: npm resuelve
# `file:../packages/...` relativo a la carpeta del package.json, que es /app, asi que
# la ruta buena es /packages. Con cualquiera de los dos fallos, `npm ci` no resuelve.
COPY packages /packages

COPY sitio-web/package.json sitio-web/package-lock.json ./
RUN npm ci

COPY sitio-web/next.config.mjs sitio-web/jsconfig.json sitio-web/tsconfig.json sitio-web/next-env.d.ts ./
COPY sitio-web/postcss.config.mjs ./
COPY sitio-web/public ./public
COPY sitio-web/src ./src

ARG BACKEND_URL=http://localhost:4000
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV BACKEND_URL=$BACKEND_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# JWT_SECRET NO entra en el build: solo lo lee el route handler de subida en
# ejecución, y como ARG quedaba grabado en la caché de capas sin necesidad alguna.
# Se inyecta en ejecución desde docker-compose.
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

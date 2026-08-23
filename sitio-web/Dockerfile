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
RUN npm ci && ln -s /app/node_modules /node_modules && ln -s /app/node_modules /packages/node_modules

# `main`/`types` de los packages @olo/* apuntan a `dist/`, no a `src/`: hace falta
# compilarlos aqui mismo, sin depender de que el host ya los haya compilado a mano
# -- es el mismo paso que ya usa `api-backend/Dockerfile`.
RUN for pkg in /packages/*; do \
      if [ -f "$pkg/tsconfig.json" ] && ! grep -q '"noEmit"[[:space:]]*:[[:space:]]*true' "$pkg/tsconfig.json"; then \
        /app/node_modules/.bin/tsc --project "$pkg"; \
      fi; \
    done

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

# El build fija `turbopack.root`/`outputFileTracingRoot` (sitio-web/next.config.mjs) al
# directorio PADRE de `sitio-web/`, porque los paquetes @olo/* viven en /packages, fuera
# de este directorio -- Next no los resuelve si la raiz de rastreo no los alcanza.
# Consecuencia verificada con un build real: el output `standalone` anida todo bajo
# `app/` (la carpeta que este Dockerfile usa como WORKDIR), en vez de dejarlo en la raiz.
# Ya no es un valor a adivinar: las tres copias de abajo van directo a esa ruta.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./app/.next/static
COPY --from=builder /app/public ./app/public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/app
CMD ["node", "server.js"]


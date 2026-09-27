# Imagen del sitio web.
#
# El contexto de build es la RAIZ del repositorio (ver `context: .` en los
# docker-compose): hacen falta tanto `3000-sitio-web/` como `packages/`.
FROM node:20-alpine AS builder

WORKDIR /app

# Los paquetes compartidos, todos, en /packages y NO en /app/packages.
#
# Dos cosas estaban mal aqui. Se copiaba uno solo de los siete que declara el
# package.json (`blocks-renderer`), y se copiaba a /app/packages: npm resuelve
# `file:../packages/...` relativo a la carpeta del package.json, que es /app, asi que
# la ruta buena es /packages. Con cualquiera de los dos fallos, `npm ci` no resuelve.
COPY packages /packages

COPY 3000-sitio-web/package.json 3000-sitio-web/package-lock.json 3000-sitio-web/.npmrc ./
RUN npm ci && ln -s /app/node_modules /node_modules && ln -s /app/node_modules /packages/node_modules

# `main`/`types` de los packages @olo/* apuntan a `dist/`, no a `src/`: hace falta
# compilarlos aqui mismo, sin depender de que el host ya los haya compilado a mano
# -- es el mismo paso que ya usa `4000-api-backend/Dockerfile`.
RUN for pkg in /packages/*; do \
      if [ -f "$pkg/tsconfig.json" ] && ! grep -q '"noEmit"[[:space:]]*:[[:space:]]*true' "$pkg/tsconfig.json"; then \
        /app/node_modules/.bin/tsc --project "$pkg"; \
      fi; \
    done

# install-links=true (3000-sitio-web/.npmrc) hace que el npm ci de arriba COPIE el
# contenido de /packages/* en vez de enlazarlo -- necesario en Windows, donde
# symlinks exige privilegios. Pero en ese momento /packages/* todavia no tenia
# dist/ (se compila recien arriba), asi que esa copia quedo sin el. Se repite
# npm ci ahora para que la copia sea la buena, con dist/ ya incluido.
RUN npm ci

COPY 3000-sitio-web/next.config.mjs 3000-sitio-web/jsconfig.json 3000-sitio-web/tsconfig.json 3000-sitio-web/next-env.d.ts ./
COPY 3000-sitio-web/postcss.config.mjs ./
COPY 3000-sitio-web/public ./public
COPY 3000-sitio-web/src ./src
# Catalogo CNO temporal (ver catalogo-cno-temporal.ts): se lee con fs.readFile
# en runtime, asi que el file-tracing de `next build` no lo detecta solo y hay
# que copiarlo a mano, igual que src/ y public/.
COPY 3000-sitio-web/data_temporal ./data_temporal

ARG BACKEND_URL=http://localhost:4000
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_INTRANET_URL=http://localhost:3001
ENV BACKEND_URL=$BACKEND_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_INTRANET_URL=$NEXT_PUBLIC_INTRANET_URL
# JWT_SECRET NO entra en el build: solo lo lee el route handler de subida en
# ejecución, y como ARG quedaba grabado en la caché de capas sin necesidad alguna.
# Se inyecta en ejecución desde docker-compose.
ENV NEXT_TELEMETRY_DISABLED=1

# `npm run build` dispara el `prebuild` del package.json, que sincroniza la copia
# de los @olo/* en node_modules (ver scripts/sincronizar-paquetes-locales.mjs).
# Aqui no debe hacer nada -- el doble `npm ci` de arriba ya dejo la copia buena, y
# reinstalar tocaria el package-lock -- pero el archivo tiene que existir igual, o
# `node ../scripts/...` aborta el build. De ahi la copia y el interruptor.
# Va a /scripts y no a /app/scripts por lo mismo que /packages: npm resuelve las
# rutas relativas desde /app, la carpeta del package.json.
COPY scripts /scripts
ENV OLO_SKIP_SYNC=1

RUN npm run build

FROM node:20-alpine

WORKDIR /app

# El build fija `turbopack.root`/`outputFileTracingRoot` (3000-sitio-web/next.config.mjs) al
# directorio PADRE de `3000-sitio-web/`, porque los paquetes @olo/* viven en /packages, fuera
# de este directorio -- Next no los resuelve si la raiz de rastreo no los alcanza.
# Consecuencia verificada con un build real: el output `standalone` anida todo bajo
# `app/` (la carpeta que este Dockerfile usa como WORKDIR), en vez de dejarlo en la raiz.
# Ya no es un valor a adivinar: las tres copias de abajo van directo a esa ruta.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./app/.next/static
COPY --from=builder /app/public ./app/public
COPY --from=builder /app/data_temporal ./app/data_temporal

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/app
CMD ["node", "server.js"]


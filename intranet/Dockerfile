# Imagen de la intranet.
#
# El contexto de build es la RAIZ del repositorio (ver `context: .` en los
# docker-compose): hacen falta tanto `intranet/` como `packages/`.
FROM node:20-alpine AS builder

WORKDIR /app

# Los paquetes compartidos van en /packages, NO en /app/packages: `package.json`
# los declara como `file:../packages/...` y npm resuelve esa ruta relativa a la
# carpeta del package.json, que aqui es /app. Faltaban por completo, asi que
# `npm ci` no podia resolver las siete dependencias @olo/*.
COPY packages /packages

COPY intranet/package.json intranet/package-lock.json intranet/.npmrc ./
RUN npm ci && ln -s /app/node_modules /node_modules && ln -s /app/node_modules /packages/node_modules

# `main`/`types` de los packages @olo/* apuntan a `dist/`, no a `src/`: hace falta
# compilarlos aqui mismo, sin depender de que el host ya los haya compilado a mano
# -- es el mismo paso que ya usa `api-backend/Dockerfile`.
RUN for pkg in /packages/*; do \
      if [ -f "$pkg/tsconfig.json" ] && ! grep -q '"noEmit"[[:space:]]*:[[:space:]]*true' "$pkg/tsconfig.json"; then \
        /app/node_modules/.bin/tsc --project "$pkg"; \
      fi; \
    done

# install-links=true (intranet/.npmrc) hace que el npm ci de arriba COPIE el
# contenido de /packages/* en vez de enlazarlo -- necesario en Windows, donde
# symlinks exige privilegios. Pero en ese momento /packages/* todavia no tenia
# dist/ (se compila recien arriba), asi que esa copia quedo sin el. Se repite
# npm ci ahora para que la copia sea la buena, con dist/ ya incluido.
RUN npm ci

COPY intranet/next.config.ts intranet/tsconfig.json intranet/postcss.config.mjs ./
# `next-env.d.ts` esta en el `include` del tsconfig. Next lo regenera si falta, pero
# copiarlo evita depender de ese comportamiento -- y es lo que ya hace sitio-web.
COPY intranet/next-env.d.ts ./
COPY intranet/public ./public
COPY intranet/data ./data
COPY intranet/eslint.config.mjs ./eslint.config.mjs
# Todo el codigo vive bajo `src/`. Antes se copiaban `app/`, `components/`, `lib/`,
# `features/` y `middleware.ts` sueltos en la raiz de la aplicacion: esa estructura
# ya no existe, asi que el build se quedaba sin fuentes.
COPY intranet/src ./src

ARG API_BACKEND_URL=http://localhost:4000
ENV API_BACKEND_URL=$API_BACKEND_URL
# Va como ARG y no solo como variable de entorno del contenedor por lo mismo que la
# `NEXT_PUBLIC_API_URL` de sitio-web: Next incrusta las NEXT_PUBLIC_* en el bundle del
# navegador AL COMPILAR, y definirla después no cambia lo ya compilado. La consumen los
# enlaces de la intranet hacia el portal publico (`shared/lib/constants.ts`).
ARG NEXT_PUBLIC_SITIO_WEB_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITIO_WEB_URL=$NEXT_PUBLIC_SITIO_WEB_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine

WORKDIR /app

# El build fija `turbopack.root`/`outputFileTracingRoot` (intranet/next.config.ts) al
# directorio PADRE de `intranet/`, porque los paquetes @olo/* viven en /packages, fuera
# de este directorio -- Next no los resuelve si la raiz de rastreo no los alcanza.
# Consecuencia verificada con un build real: el output `standalone` anida todo bajo
# `app/` (la carpeta que este Dockerfile usa como WORKDIR), en vez de dejarlo en la raiz.
# Ya no es un valor a adivinar: las tres copias de abajo van directo a esa ruta.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./app/.next/static
COPY --from=builder /app/public ./app/public

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/app
CMD ["node", "server.js"]


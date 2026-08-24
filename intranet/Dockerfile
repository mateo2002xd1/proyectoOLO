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

COPY intranet/package.json intranet/package-lock.json ./
RUN npm ci && ln -s /app/node_modules /node_modules && ln -s /app/node_modules /packages/node_modules

# `main`/`types` de los packages @olo/* apuntan a `dist/`, no a `src/`: hace falta
# compilarlos aqui mismo, sin depender de que el host ya los haya compilado a mano
# -- es el mismo paso que ya usa `api-backend/Dockerfile`.
RUN for pkg in /packages/*; do \
      if [ -f "$pkg/tsconfig.json" ] && ! grep -q '"noEmit"[[:space:]]*:[[:space:]]*true' "$pkg/tsconfig.json"; then \
        /app/node_modules/.bin/tsc --project "$pkg"; \
      fi; \
    done

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


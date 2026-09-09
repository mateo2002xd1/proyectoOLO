# Imagen de la API.
#
# El contexto de build es la RAIZ del repositorio, no `api-backend/` (ver el
# `context: .` de los docker-compose). Hace falta asi porque el proyecto no es un
# monorepo con workspaces pero si comparte codigo por `file:../packages/...`, y esas
# rutas salen de la carpeta de la aplicacion.
FROM node:20-alpine AS builder

WORKDIR /app

# Los paquetes compartidos van en /packages, NO en /app/packages.
#
# `package.json` declara `@olo/slug-policy: file:../packages/slug-policy`, y npm
# resuelve esa ruta relativa a la carpeta que contiene el package.json. Con el
# package.json en /app, `../packages` es /packages. Copiarlos dentro de /app dejaba
# `npm ci` sin poder resolver la dependencia.
#
# Van antes que el `npm ci` porque este los necesita presentes para instalarlos.
COPY packages /packages

COPY api-backend/package.json api-backend/package-lock.json api-backend/.npmrc ./
RUN npm ci

COPY api-backend/tsconfig.json ./
COPY api-backend/src ./src
# `scripts/` lo necesita la etapa de migraciones: `npm run migrate` es
# `ts-node scripts/migrate.ts`, y sin esta copia esa etapa no tiene que ejecutar.
COPY api-backend/scripts ./scripts

RUN for pkg in /packages/*; do \
      if [ -f "$pkg/tsconfig.json" ] && ! grep -q '"noEmit"[[:space:]]*:[[:space:]]*true' "$pkg/tsconfig.json"; then \
        /app/node_modules/.bin/tsc --project "$pkg"; \
      fi; \
    done

# install-links=true (api-backend/.npmrc) hace que el npm ci de arriba COPIE el
# contenido de /packages/* en vez de enlazarlo -- necesario en Windows, donde
# symlinks exige privilegios. Pero en ese momento /packages/* todavia no tenia
# dist/ (se compila recien arriba), asi que esa copia quedo sin el. Se repite
# npm ci ahora para que la copia sea la buena, con dist/ ya incluido.
RUN npm ci

# `npm run build` dispara el `prebuild` del package.json, que sincroniza la copia
# de los @olo/* en node_modules (ver scripts/sincronizar-paquetes-locales.mjs).
# Aqui no debe hacer nada -- el `npm ci` de arriba ya dejo la copia buena, y
# reinstalar tocaria el package-lock -- pero el archivo tiene que existir igual, o
# `node ../scripts/...` aborta el build. De ahi la copia y el interruptor.
# Ojo: /scripts NO es /app/scripts (los scripts de migracion del backend). Son dos
# carpetas distintas; npm resuelve `../scripts` desde /app, que es la raiz.
COPY scripts /scripts
ENV OLO_SKIP_SYNC=1

RUN npm run build

# --- Imagen final ----------------------------------------------------------
#
# Deliberadamente sin `ts-node` ni `scripts/`: aqui solo corre JavaScript ya
# compilado. Las migraciones NO se aplican desde esta imagen sino desde la etapa
# `builder`, que si tiene las dependencias de desarrollo -- ver el servicio
# `migraciones` de los docker-compose y `./deploy.sh migrar`.
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /packages /packages

COPY api-backend/package.json api-backend/package-lock.json api-backend/.npmrc ./
RUN npm ci --omit=dev

# npm ci crea symlinks para las dependencias `file:`. Los symlinks funcionan,
# pero Node.js sigue la cadena real y acaba leyendo `src/index.ts` si el paquete
# no tiene `dist/`. Reemplazamos los symlinks con copias fisicas del contenido
# compilado para que Node siempre encuentre `dist/index.js`.
RUN for pkg in /app/node_modules/@olo/*; do \
      if [ -L "$pkg" ]; then \
        target=$(readlink -f "$pkg"); \
        rm "$pkg"; \
        cp -r "$target" "$pkg"; \
      fi; \
    done

COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/server.js"]


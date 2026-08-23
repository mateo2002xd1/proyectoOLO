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

COPY api-backend/package.json api-backend/package-lock.json ./
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

COPY api-backend/package.json api-backend/package-lock.json ./
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


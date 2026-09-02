#!/bin/sh
# Compila los paquetes @olo/* compartidos antes de arrancar el servidor de
# desarrollo. Hace falta porque en modo dev `/packages` viene montado en vivo
# desde el host (ver docker-compose.override.yml) y no trae el `dist/` que el
# build de imagen genera -- sin este paso, cualquier `require`/`import` de un
# paquete cuyo `main` apunte a `dist/index.js` falla al arrancar.
#
# Los paquetes con `"noEmit": true` en su tsconfig (blocks-renderer,
# inactividad) se saltan a propósito: su `main` apunta directo a
# `src/index.ts` y Next los transpila él mismo vía `transpilePackages` -- no
# hay nada que compilar aquí. Mismo criterio que ya usan los Dockerfile.
set -e

for pkg in /packages/*; do
  if [ -f "$pkg/tsconfig.json" ] && ! grep -q '"noEmit"[[:space:]]*:[[:space:]]*true' "$pkg/tsconfig.json"; then
    /app/node_modules/.bin/tsc --project "$pkg"
  fi
done

exec "$@"

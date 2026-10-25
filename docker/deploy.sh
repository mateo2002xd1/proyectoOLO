#!/usr/bin/env bash
# Script de despliegue del OLO.
# Uso: ./docker/deploy.sh [comando]
#
# Opera sobre `docker/docker-compose.servidor.yml`: la pila de produccion publicada con un
# tunel. Es la unica que queda en el repo; las de dominio propio con SSL y las de
# desarrollo se retiraron el 2026-09-23 y siguen en el historial de git (ver
# docker/guia-bash.md).

set -Eeuo pipefail

# Este script vive en docker/ pero todas las rutas de abajo (COMPOSE_FILE, ENV_FILE,
# docker/sql/) son relativas a la RAIZ del repo -- de ahi este cd, que hace que
# invocarlo funcione igual desde la raiz (`./docker/deploy.sh`) que desde dentro de
# `docker/` (`./deploy.sh`) o desde cualquier otro directorio.
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

COMPOSE_FILE="docker/docker-compose.servidor.yml"
ENV_FILE=".env"

# Todo lo que sube la gente (adjuntos de paginas y Excel de cargas). Es `external` en el
# compose para que un `down -v` no se lo lleve, asi que lo crea este script y no Compose.
VOLUMEN_DE_ARCHIVOS="olo-app_filesystem"

# Para copiar, empaquetar y desempaquetar el volumen sin instalar nada en el equipo.
IMAGEN_UTILIDADES="alpine:3"

# Cada uno de estos tumba algo si llega vacio: la API aborta el arranque sin
# `JWT_SECRET`, Postgres no inicializa sin contrasena, Redis arranca sin clave, y sin las
# dos direcciones publicas el navegador no encuentra la API ni la otra aplicacion.
VARIABLES_REQUERIDAS=(POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD JWT_SECRET REVALIDAR_SECRET
                      REDIS_PASSWORD SITIO_WEB_URL_PUBLICA INTRANET_URL_PUBLICA)

# Secretos que el script puede generar solo porque no dependen de nada externo: nadie
# mas los conoce y no hay que hacerlos coincidir con ningun sistema previo. Los dominios
# y las credenciales del superadmin NO estan aqui a proposito - esos los decide una
# persona.
VARIABLES_AUTOGENERABLES=(JWT_SECRET REVALIDAR_SECRET POSTGRES_PASSWORD REDIS_PASSWORD)

rojo()  { printf '\033[0;31m%s\033[0m\n' "$*"; }
verde() { printf '\033[0;32m%s\033[0m\n' "$*"; }
aviso() { printf '\033[0;33m%s\033[0m\n' "$*"; }

morir() { rojo "ERROR: $*"; exit 1; }

# Todas las llamadas a docker compose pasan por aqui, por dos razones que solo se
# notan en Windows:
#
#  1. MSYS_NO_PATHCONV. Git Bash reescribe cualquier argumento que parezca una ruta
#     absoluta de Unix: `-w /var/www/certbot` le llega a Docker como
#     `C:/Program Files/Git/var/www/certbot`. Esas rutas son del CONTENEDOR, no del
#     host, asi que la conversion las destruye. En Linux y macOS la variable se ignora.
#
#  2. `-T` en run/exec. Sin el, Docker intenta reservar un TTY y la terminal de Git Bash
#     (MinTTY) no se lo da: "the input device is not a TTY". Ningun comando de este
#     script necesita terminal interactiva, asi que desactivarlo es gratis.
#
#  3. `--project-directory .`. El archivo compose vive en `docker/`, no en la raiz, pero
#     todas sus rutas relativas (`context: .`, `env_file: .env`, los volumenes de
#     nginx) estan escritas como si vivieran en la raiz -- porque esta bandera hace
#     que Compose las resuelva contra la raiz (el `cd` de arriba) en vez de contra la
#     carpeta del propio archivo compose. Sin esto, `context: .` apuntaria a `docker/`
#     y el build no encontraria `4000-api-backend/`, `3000-sitio-web/`, etc.
componer() { MSYS_NO_PATHCONV=1 docker compose --project-directory . --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"; }

# `--profile tools` es lo que incluye `migraciones`: sin el, `build` se salta los servicios
# con perfil y esa imagen se queda con el codigo de su primer build. Despues de un
# `git pull`, las migraciones nuevas no se aplicaban y la API se negaba a arrancar.
construir() { componer --profile tools build "$@"; }

show_help() {
    cat <<'AYUDA'
============================================
  OLO Proyect - Script de Despliegue
============================================

Uso: ./docker/deploy.sh [comando]

Comandos:
  setup     - Primera configuracion (crear .env, generar secretos, construir)
  start     - Aplicar migraciones e iniciar o actualizar todos los servicios
  stop      - Detener todos los servicios
  restart   - Reiniciar contenedores existentes (no aplica imagenes nuevas)
  logs      - Ver logs en tiempo real
  status    - Ver estado de los servicios
  build     - Reconstruir imagenes
  migrar    - Aplicar las migraciones de esquema pendientes
  sembrar   - Cargar el contenido inicial (paginas, identidad visual)
  importar  - Copiar los datos de la base de origen (ORIGEN_DATABASE_URL), sin cuentas
              (solo instalacion nueva: se niega si ya hay usuarios)
  importar-paginas - Traer del origen SOLO las paginas (y sus archivos de filesystem/),
              conservando los usuarios y todo lo demas de este servidor. Con
              --desde-archivo[=ruta] las lee del volcado que trae git (por defecto
              4000-api-backend/seed/paginas-volcado.sql) en vez de conectarse al origen
  exportar-paginas - (En desarrollo, sin Docker) Generar ese volcado desde la base de
              desarrollo: cada pagina publicada como version 1, sin historial ni visitas.
              Con --con-historial lleva todas las versiones. Luego: git add, commit y push
  crear-admin - Crear la primera cuenta de Superadmin (solo instalacion nueva)
  retirar-rol - Retirar un rol que ya no existe (por defecto visitante_interno) y decidir
              que pasa con sus cuentas. Sin --aplicar solo informa. Uso:
              ./docker/deploy.sh retirar-rol [--rol=X] [--reasignar-a=ROL | --inactivar-usuarios |
              --borrar-usuarios] [--aplicar]
  backup    - Backup de la base de datos y de los archivos subidos
  restore   - Restaurar backup de la base (uso: ./docker/deploy.sh restore backup.sql)
  restore-archivos - Restaurar los archivos subidos (uso: ... restore-archivos archivos_X.tar.gz)
  migrar-archivos  - Copiar al volumen los archivos de las carpetas del repo y de filesystem/
  help      - Mostrar esta ayuda
AYUDA
}

# --- Comprobaciones previas -------------------------------------------------
#
# Van antes de cualquier comando de docker porque sus errores son mucho peores de
# leer: sin el demonio arrancado, `docker compose ps` responde con un volcado sobre
# un socket que no dice que hacer.
comprobar_requisitos() {
    command -v docker >/dev/null 2>&1 || morir "Docker no esta instalado o no esta en el PATH."

    docker compose version >/dev/null 2>&1 ||
        morir "No se encontro 'docker compose' (v2). En instalaciones antiguas el comando es 'docker-compose'."

    docker info >/dev/null 2>&1 ||
        morir "El demonio de Docker no responde. Esta arrancado? (sudo systemctl start docker)"

    [ -f "$COMPOSE_FILE" ] || morir "No existe el archivo compose '$COMPOSE_FILE'."

    # El volumen de archivos es un requisito de la pila como lo es Docker: sin el, Compose
    # se niega a levantar la API ("external volume not found"). Crearlo es idempotente.
    if ! docker volume inspect "$VOLUMEN_DE_ARCHIVOS" >/dev/null 2>&1; then
        docker volume create "$VOLUMEN_DE_ARCHIVOS" >/dev/null
        verde "Volumen de archivos creado: $VOLUMEN_DE_ARCHIVOS"
    fi
}

# Ruta de una carpeta del equipo tal como la entiende Docker. En Git Bash `pwd` da
# /c/OLO y Docker Desktop espera C:/OLO, que es lo que da `pwd -W`; en Linux esa opcion
# no existe y vale `pwd`.
ruta_para_docker() { (cd "$1" && { pwd -W 2>/dev/null || pwd; }); }

# Lee una clave del .env sin ejecutarlo.
#
# Con `source` bastaria una linea, pero eso ejecuta el archivo: un valor con comillas
# sin cerrar o una sustitucion de comando dentro de una contrasena se convierte en
# codigo corriendo como quien despliega. Esto solo lee.
#
# El `tr -d` cubre el .env editado en Windows: docker-compose no lo limpia, asi que un
# CRLF acaba metiendo un retorno de carro DENTRO del valor del secreto, y el fallo que
# produce despues no se parece en nada a la causa.
leer_env() {
    [ -f "$ENV_FILE" ] || return 0
    sed -n "s/^$1=//p" "$ENV_FILE" | tail -n1 | tr -d '\015'
}

comprobar_entorno() {
    [ -f "$ENV_FILE" ] || morir "No existe '$ENV_FILE'. Ejecuta primero: ./docker/deploy.sh setup"

    # Se compara el archivo contra si mismo sin retornos de carro: si difieren, los
    # tenia. No vale `grep "$(printf '\015')"` -la sustitucion de comando se come el
    # CR y el patron acaba vacio, que casa con todo o con nada segun el grep.
    if ! tr -d '\015' < "$ENV_FILE" | cmp -s - "$ENV_FILE"; then
        aviso "AVISO: '$ENV_FILE' tiene finales de linea CRLF (Windows)."
        aviso "       docker-compose incluiria el retorno de carro dentro de cada valor."
        aviso "       Corrigelo con:  dos2unix $ENV_FILE"
    fi

    local clave
    local faltantes=()
    for clave in "${VARIABLES_REQUERIDAS[@]}"; do
        [ -z "$(leer_env "$clave")" ] && faltantes+=("$clave")
    done

    if [ ${#faltantes[@]} -gt 0 ]; then
        rojo "Faltan valores obligatorios en $ENV_FILE:"
        printf '  - %s\n' "${faltantes[@]}"
        echo ""
        echo "Rellenalos y vuelve a ejecutar. Para los secretos: openssl rand -hex 32"
        exit 1
    fi

    # Van tal cual al bundle del navegador y a CORS: una barra final o un http:// no dan
    # error al construir, dan un sitio que no conecta con su API, y se descubre tarde.
    local nombre url
    for nombre in SITIO_WEB_URL_PUBLICA INTRANET_URL_PUBLICA; do
        url=$(leer_env "$nombre")
        # http://localhost:<puerto> se acepta para probar en el propio equipo antes de
        # tener el tunel; para publicar hay que reconstruir con las https del tunel.
        [[ "$url" =~ ^https://[^/]+$ || "$url" =~ ^http://localhost:[0-9]+$ ]] ||
            morir "$nombre debe ser https://<host> sin barra final (esta: '$url')."
    done

    # El mismo valor en los dos serviria tecnicamente, pero anula la unica ventaja de
    # tenerlos separados: que filtrar el de revalidacion no permita firmar sesiones.
    if [ "$(leer_env JWT_SECRET)" = "$(leer_env REVALIDAR_SECRET)" ]; then
        aviso "AVISO: JWT_SECRET y REVALIDAR_SECRET tienen el mismo valor."
        aviso "       Genera uno propio para cada uno (openssl rand -hex 32)."
    fi
}

# --- Comandos ---------------------------------------------------------------

# Migra el esquema, valida que el mapeo modelo-columna siga correcto y reconcilia el
# catalogo de permisos con el codigo. Los tres pasos son idempotentes -correrlos de mas
# no hace nada-, asi que start() y migrar() comparten esta misma secuencia sin duplicarla.
# Antes eran pasos manuales (ver docker/guia-bash.md); van aqui para que ningun empaquetado
# deje el esquema o los permisos desincronizados de lo que dice el codigo.
aplicar_migraciones() {
    componer up -d db
    componer run --rm -T migraciones
    componer run --rm -T migraciones npm run db:verificar
    componer run --rm -T migraciones npm run sembrar:permisos
}

setup() {
    comprobar_requisitos
    echo "=== Configuracion inicial ==="

    if [ ! -f "$ENV_FILE" ]; then
        [ -f .env.example ] || morir "No existe .env.example, no hay plantilla que copiar."
        cp .env.example "$ENV_FILE"
        verde "Archivo .env creado desde .env.example"
    else
        echo "Archivo .env ya existe, se conserva"
    fi

    # Solo se rellena lo que este vacio: si ya hay valor, es que alguien lo puso -o la
    # base ya se inicializo con esa contrasena- y regenerarlo dejaria la pila sin poder
    # conectarse a sus propios datos.
    local clave valor
    local generadas=()
    for clave in "${VARIABLES_AUTOGENERABLES[@]}"; do
        if [ -z "$(leer_env "$clave")" ]; then
            # `-hex` y no `-base64`: base64 produce '/' y '+', y la barra rompe tanto el
            # sed de abajo como las URL de conexion donde la contrasena va embebida.
            valor=$(openssl rand -hex 32)
            if grep -q "^$clave=" "$ENV_FILE"; then
                sed -i.bak "s|^$clave=.*|$clave=$valor|" "$ENV_FILE"
                rm -f "$ENV_FILE.bak"
            else
                printf '%s=%s\n' "$clave" "$valor" >> "$ENV_FILE"
            fi
            generadas+=("$clave")
        fi
    done

    if [ ${#generadas[@]} -gt 0 ]; then
        verde "Secretos generados: ${generadas[*]}"
    fi

    # Lo que queda sin valor solo lo puede decidir una persona.
    local pendientes=()
    for clave in "${VARIABLES_REQUERIDAS[@]}"; do
        [ -z "$(leer_env "$clave")" ] && pendientes+=("$clave")
    done

    if [ ${#pendientes[@]} -gt 0 ]; then
        echo ""
        aviso "Faltan por rellenar a mano en $ENV_FILE:"
        printf '  - %s\n' "${pendientes[@]}"
        echo ""
        echo "Editalo (nano $ENV_FILE) y vuelve a ejecutar: ./docker/deploy.sh setup"
        exit 0
    fi

    echo ""
    echo "=== Construyendo imagenes ==="
    construir

    echo ""
    verde "=== Setup completado ==="
    echo "Ejecuta: ./docker/deploy.sh start"
}

start() {
    comprobar_requisitos
    comprobar_entorno

    # Las migraciones van ANTES de levantar la API, no despues: `server.ts` aborta si
    # encuentra alguna pendiente, y con `restart: unless-stopped` eso es un bucle de
    # reinicio en vez de un error visible. Es idempotente -si no hay pendientes no hace
    # nada-, asi que no molesta en los arranques siguientes.
    echo "=== Aplicando migraciones de esquema ==="
    aplicar_migraciones

    echo ""
    echo "=== Iniciando servicios ==="
    componer up -d
    echo ""
    verde "Servicios iniciados. Verifica con: ./docker/deploy.sh status"

    echo ""
    echo "nginx atiende en este equipo:  sitio http://localhost:8080  |  intranet http://localhost:8081"
    echo "Desde fuera se entra por el tunel: $(leer_env SITIO_WEB_URL_PUBLICA)  |  $(leer_env INTRANET_URL_PUBLICA)"
}

stop() {
    comprobar_requisitos
    echo "=== Deteniendo servicios ==="
    componer down
}

restart() {
    comprobar_requisitos
    echo "=== Reiniciando servicios ==="
    componer restart
}

logs()   { comprobar_requisitos; componer logs -f; }
status() { comprobar_requisitos; componer ps; }

build() {
    comprobar_requisitos
    echo "=== Reconstruyendo imagenes ==="
    construir --no-cache
    echo ""
    verde "Imagenes reconstruidas. Ejecuta: ./docker/deploy.sh start"
}

migrar() {
    comprobar_requisitos
    comprobar_entorno
    echo "=== Aplicando migraciones de esquema ==="
    # Necesita la base arriba y sana; `depends_on: service_healthy` del servicio se
    # encarga de esperarla, pero si la pila esta parada hay que levantarla antes.
    aplicar_migraciones
    verde "Migraciones al dia"
}

SEED="4000-api-backend/seed/contenido-inicial.sql"
# El volcado de paginas que se genera en desarrollo (npm run paginas:volcar) y viaja por git.
ARCHIVO_DE_PAGINAS="4000-api-backend/seed/paginas-volcado.sql"
SEED_ROLES="4000-api-backend/seed/roles-y-permisos.sql"

sembrar() {
    comprobar_requisitos
    comprobar_entorno

    [ -f "$SEED" ] || morir "No existe '$SEED'. Regeneralo con: npm run seed:generar (en 4000-api-backend/)"

    local usuario base
    usuario=$(leer_env POSTGRES_USER)
    base=$(leer_env POSTGRES_DB)

    echo "=== Cargando roles y permisos iniciales ==="
    componer up -d db
    if [ -f "$SEED_ROLES" ]; then
        componer exec -T db \
            psql -v ON_ERROR_STOP=1 -U "$usuario" "$base" < "$SEED_ROLES"
    fi

    # El bootstrap SQL de arriba puede quedar desactualizado frente al catalogo real en
    # codigo (src/shared/catalogo-permisos.ts). Correr el reconciliador justo despues
    # corrige cualquier diferencia sin tener que mantener las dos fuentes sincronizadas a
    # mano -- es el mismo paso que ya corre aplicar_migraciones() en start/migrar.
    componer run --rm -T migraciones npm run sembrar:permisos

    echo "=== Cargando contenido inicial ==="
    # Va DESPUES de las migraciones: el archivo inserta filas en tablas que crean ellas.
    # Es idempotente (ON CONFLICT DO NOTHING), asi que repetirlo no duplica nada, pero
    # tampoco pisa lo que ya haya: para reemplazar contenido existente hay que vaciarlo
    # antes a mano.
    componer exec -T db \
        psql -v ON_ERROR_STOP=1 -U "$usuario" "$base" < "$SEED"
    verde "Contenido y roles iniciales cargados"
}

crear_admin() {
    comprobar_requisitos
    comprobar_entorno

    # En produccion esta es la UNICA puerta de entrada: la cuenta maestra de LOCAL_AUTH_*
    # se apaga sola con NODE_ENV=production, y dar de alta usuarios por la API exige estar
    # ya autenticado. Sin esto se despliega el sistema entero y no entra nadie.
    echo "=== Primera cuenta de Superadmin ==="
    echo "Solo funciona sobre una base sin usuarios. Las demas altas van por el panel."
    echo ""

    local correo clave clave2
    read -r -p "Correo: " correo
    [ -n "$correo" ] || morir "El correo es obligatorio."

    # `-s` para que la contrasena no aparezca en pantalla ni en el historial del shell.
    read -r -s -p "Contrasena (12+ caracteres, 3 de: mayuscula, minuscula, numero, simbolo): " clave
    echo
    read -r -s -p "Repitela: " clave2
    echo
    [ "$clave" = "$clave2" ] || morir "Las contrasenas no coinciden."

    # Corre en la etapa `builder`, la unica con ts-node. La contrasena viaja como variable
    # de entorno del contenedor: no queda en el historial, aunque durante los segundos que
    # dura si seria visible en un `ps` para otro usuario del servidor.
    componer up -d db
    componer run --rm -T \
        -e ADMIN_EMAIL="$correo" \
        -e ADMIN_PASSWORD="$clave" \
        migraciones npm run crear:superadmin
}

# Retira un rol que el producto ya no tiene (visitante_interno, retirado el 2026-09-15) y deja
# decidir, cuenta por cuenta, que pasa con quien aun lo tenga. Sin --aplicar SOLO INFORMA: es lo
# que hay que correr primero en produccion para saber si hay alguien. Los argumentos pasan tal
# cual al script de la API (scripts/db/retirar-rol.ts), que hace todo en una transaccion y deja
# cada cambio en la bitacora.
retirar_rol() {
    comprobar_requisitos
    comprobar_entorno

    echo "=== Retirar rol ==="
    componer up -d db
    componer run --rm -T migraciones npm run roles:retirar -- "$@"
}

# Tablas cuyo CONTENIDO no viaja al importar. Su estructura si existe (la crean las
# migraciones); solo llegan vacias.
#  - usuarios, preguntas_seguridad: las cuentas y sus datos personales. La instalacion
#    nueva nace sin cuentas; la primera se crea con `crear-admin`.
#  - auditoria_cambios: la bitacora guarda nombre, IP y navegador de cada persona.
#  - bloqueos_edicion, subidas_pendientes: estado temporal de sesiones del origen.
#  - migraciones_aplicadas: describe el esquema de ESTA base, no son datos.
TABLAS_QUE_NO_VIAJAN=(usuarios preguntas_seguridad auditoria_cambios bloqueos_edicion subidas_pendientes migraciones_aplicadas)

# pg_dump tiene que ser de la misma version mayor que el servidor de origen (Neon, 18) o
# mayor. Corre en un contenedor desechable: no hay que instalar nada en el equipo.
IMAGEN_CLIENTE_PG="postgres:18-alpine"

# Cuantas cuentas tiene la base de esta instalacion (0 si la tabla aun no existe: base
# recien creada, sin migraciones). `query_to_xml` solo corre si la tabla existe.
contar_usuarios() {
    componer up -d --wait db >/dev/null
    componer exec -T db psql -U "$1" -d "$2" -At -c \
        "SELECT (xpath('/row/n/text()', query_to_xml('SELECT count(*) AS n FROM public.usuarios', false, true, '')))[1]::text WHERE to_regclass('public.usuarios') IS NOT NULL" |
        tr -d '\r'
}

# La conexion al origen tal como la necesita pg_dump/psql dentro del contenedor.
url_de_origen() {
    local origen
    origen=$(leer_env ORIGEN_DATABASE_URL)
    # A stderr y con `return`, no con `morir`: se llama dentro de `$(...)`, que se
    # quedaria el mensaje en la variable en vez de mostrarlo.
    if [ -z "$origen" ]; then
        rojo "ERROR: Falta ORIGEN_DATABASE_URL en $ENV_FILE: la conexion a la base de donde se copian los datos (ver docker/guia-bash.md)." >&2
        return 1
    fi
    # Con sslmode=verify-* libpq busca el certificado raiz en ~/.postgresql/root.crt, que
    # el contenedor no tiene; `system` le dice que use los del sistema.
    if [[ "$origen" == *sslmode=verify-* && "$origen" != *sslrootcert=* ]]; then
        origen="${origen}&sslrootcert=system"
    fi
    printf '%s' "$origen"
}

SQL_CONTEO_POR_TABLA="SELECT table_name, (xpath('/row/n/text()', query_to_xml(format('SELECT count(*) AS n FROM public.%I', table_name), false, true, '')))[1]::text FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"

# Reemplaza los datos de esta instalacion por los de la base de origen
# (ORIGEN_DATABASE_URL en el .env), menos TABLAS_QUE_NO_VIAJAN.
importar() {
    comprobar_requisitos
    comprobar_entorno

    local origen usuario base volcado respuesta tabla
    origen=$(url_de_origen) || exit 1
    usuario=$(leer_env POSTGRES_USER)
    base=$(leer_env POSTGRES_DB)

    # Importar vacia TODAS las tablas, cuentas incluidas: es para una instalacion nueva.
    # Con cuentas ya creadas se niega, para que un servidor en uso no pierda sus usuarios
    # por equivocacion de comando. Para traer solo las paginas: importar-paginas.
    local cuentas
    cuentas=$(contar_usuarios "$usuario" "$base")
    if [ "${cuentas:-0}" -gt 0 ]; then
        morir "Este servidor ya tiene $cuentas usuario(s) e 'importar' los borraria. Para traer las paginas sin tocar las cuentas: ./docker/deploy.sh importar-paginas"
    fi

    echo "=== Importar datos desde la base de origen ==="
    aviso "Esto BORRA todos los datos de la base '$base' de esta instalacion, cuentas incluidas,"
    aviso "y los reemplaza por los de la base de origen. No viajan: ${TABLAS_QUE_NO_VIAJAN[*]}."
    read -r -p "Continuar? (s/n): " -n 1 respuesta
    echo
    if [[ ! $respuesta =~ ^[Ss]$ ]]; then
        echo "Cancelado"
        return 0
    fi

    echo ""
    echo "--- 1/5 Esquema al dia (migraciones) ---"
    aplicar_migraciones

    echo ""
    echo "--- 2/5 Copiando los datos del origen ---"
    local excluir=()
    for tabla in "${TABLAS_QUE_NO_VIAJAN[@]}"; do
        excluir+=("--exclude-table-data=public.$tabla")
    done
    volcado="importacion_$(date +%Y%m%d_%H%M%S).sql"
    # --disable-triggers: deja entrar filas cuyo autor es un usuario que no viaja, y las
    # referencias circulares (paginas <-> paginas_versiones) sin importar el orden.
    # importar-despues.sql arregla esas referencias y comprueba todas antes de confirmar.
    if ! MSYS_NO_PATHCONV=1 docker run --rm "$IMAGEN_CLIENTE_PG" pg_dump "$origen" \
            --data-only --disable-triggers --no-owner --no-privileges --schema=public \
            "${excluir[@]}" > "$volcado"; then
        rm -f "$volcado"
        morir "No se pudo leer la base de origen. Revisa ORIGEN_DATABASE_URL y la conexion a internet."
    fi

    echo ""
    echo "--- 3/5 Cargando (una sola transaccion: si algo falla, no cambia nada) ---"
    if ! cat docker/sql/importar-antes.sql "$volcado" docker/sql/importar-despues.sql |
            componer exec -T db psql -q -v ON_ERROR_STOP=1 --single-transaction -U "$usuario" -d "$base"; then
        morir "La carga fallo y se deshizo entera: la base quedo como estaba. El volcado sigue en $volcado para revisarlo."
    fi
    rm -f "$volcado"

    echo ""
    echo "--- 4/5 Comparacion: filas en el origen y aqui ---"
    # Antes de sembrar permisos a proposito: ese paso puede anadir filas a roles_permisos
    # y la comparacion mostraria una diferencia que no es del traspaso.
    local conteo_origen conteo_destino
    conteo_origen=$(MSYS_NO_PATHCONV=1 docker run --rm "$IMAGEN_CLIENTE_PG" \
        psql "$origen" -AtF ' ' -c "$SQL_CONTEO_POR_TABLA" | tr -d '\r' | LC_ALL=C sort)
    conteo_destino=$(componer exec -T db psql -U "$usuario" -d "$base" -AtF ' ' -c "$SQL_CONTEO_POR_TABLA" |
        tr -d '\r' | LC_ALL=C sort)
    local distintas=0 t o d nota
    printf '  %-28s %8s %8s\n' TABLA ORIGEN AQUI
    while read -r t o d; do
        nota=""
        [[ " ${TABLAS_QUE_NO_VIAJAN[*]} " == *" $t "* ]] && nota="(no viaja)"
        # Una tabla que crean las migraciones y que en el origen ya se borro a mano
        # (p. ej. `_obsoleto_attachment`): vacia aqui, no es una diferencia de datos.
        [ -z "$nota" ] && [ "$o" = "-" ] && [ "$d" = "0" ] && nota="(solo existe aqui, vacia)"
        if [ -z "$nota" ] && [ "$o" != "$d" ]; then
            nota="<-- DISTINTO"
            distintas=$((distintas + 1))
        fi
        printf '  %-28s %8s %8s  %s\n' "$t" "$o" "$d" "$nota"
    done < <(LC_ALL=C join -a1 -a2 -e '-' -o '0,1.2,2.2' <(echo "$conteo_origen") <(echo "$conteo_destino"))

    echo ""
    echo "--- 5/5 Contenido, permisos y cache ---"
    # El contenido importado entra por SQL, sin pasar por el sanitizador de la API (XSS-08): lo que
    # traiga el origen —un `javascript:` en un boton, un iframe a un sitio ajeno— llegaria a todos
    # tal cual. Se sanea aqui, en la base de destino, antes de que nadie lo vea.
    componer run --rm -T migraciones npm run contenido:revisar -- --aplicar
    componer run --rm -T migraciones npm run sembrar:permisos
    # La API guarda respuestas en Redis: sin vaciarlo seguiria sirviendo lo de antes.
    # El sitio tiene ademas su propia cache de Next, que caduca sola en un minuto.
    componer exec -T redis redis-cli --no-auth-warning -a "$(leer_env REDIS_PASSWORD)" FLUSHALL >/dev/null

    echo ""
    if [ "$distintas" -gt 0 ]; then
        aviso "Hay $distintas tabla(s) con un numero de filas distinto al del origen: revisalas arriba."
    else
        verde "=== Datos importados: todas las tablas coinciden con el origen ==="
    fi
    echo "Siguiente paso: ./docker/deploy.sh crear-admin   (la base quedo sin cuentas)"
    aviso "Cuando termines de importar, borra ORIGEN_DATABASE_URL del $ENV_FILE: es la clave de la base de origen."
}

# Trae del origen SOLO las paginas (sitio e intranet, con todas sus versiones) y sus
# archivos de filesystem/, sin tocar nada mas de esta base: usuarios, roles, bitacora y
# datos se quedan como estan. Es lo que se usa en un servidor en marcha para llevar lo que
# se preparo en el origen. Repetirlo no hace dano: cada vez deja las paginas como alli.
#
# Lo que no coincide entre las dos bases se traduce en importar-paginas-despues.sql: la
# autoria pasa a la cuenta de aqui con el mismo correo, y los permisos de edicion se
# conceden por nombre de rol. Las visitas de cada pagina son las de este servidor.
#
# El origen es la base en vivo (ORIGEN_DATABASE_URL) o, con --desde-archivo, el volcado que
# se genero en desarrollo con `npm run paginas:volcar` y llego por git: asi el servidor no
# necesita alcanzar la base de origen. Ese archivo no lleva correos (no deben ir a GitHub),
# asi que con el la autoria de las versiones queda vacia.
importar_paginas() {
    local origen="" usuario base volcado respuesta completo=1 archivo="" arg sin_respaldos=""
    # Los argumentos y el archivo se validan antes de pedir Docker o el .env: un error de
    # uso no tiene por que arrancar nada.
    for arg in "$@"; do
        case "$arg" in
            --desde-archivo) archivo="$ARCHIVO_DE_PAGINAS" ;;
            --desde-archivo=?*) archivo="${arg#--desde-archivo=}" ;;
            *) morir "Opcion desconocida: '$arg'. Uso: ./docker/deploy.sh importar-paginas [--desde-archivo[=ruta]]" ;;
        esac
    done
    if [ -n "$archivo" ]; then
        [ -f "$archivo" ] || morir "No existe '$archivo'. Haz git pull, o genera el volcado en desarrollo con: npm run paginas:volcar (en 4000-api-backend/)"
        grep -q '^-- conteo: paginas=[0-9]* paginas_versiones=[0-9]*$' "$archivo" ||
            morir "'$archivo' no parece un volcado de npm run paginas:volcar (falta la linea '-- conteo:')."
        # Sin historial no hay versiones archivadas: los respaldos de filesystem/*/backup
        # serian archivos de versiones que aqui no existen.
        grep -q '^-- modo: inicio-limpio' "$archivo" && sin_respaldos=1
    fi

    comprobar_requisitos
    comprobar_entorno

    [ -n "$archivo" ] || origen=$(url_de_origen) || exit 1
    usuario=$(leer_env POSTGRES_USER)
    base=$(leer_env POSTGRES_DB)

    if [ -n "$archivo" ]; then
        echo "=== Importar solo las paginas desde un archivo ==="
        if [ -n "$sin_respaldos" ]; then
            aviso "Reemplaza las paginas de '$base' (sitio e intranet) por las de $archivo: cada una como version 1, sin historial."
        else
            aviso "Reemplaza las paginas de '$base' (sitio e intranet, con todas sus versiones) por las de $archivo."
        fi
        aviso "$(sed -n 's/^-- Generado el /Generado el /p' "$archivo" | head -n1 | tr -d '\015'). Las versiones quedan sin autor: el archivo no lleva cuentas."
    else
        echo "=== Importar solo las paginas desde la base de origen ==="
        aviso "Reemplaza las paginas de '$base' (sitio e intranet, con todas sus versiones) por las del origen."
    fi
    aviso "NO toca usuarios, roles, bitacora ni ninguna otra tabla. Las visitas se conservan."
    if [ -n "$sin_respaldos" ]; then
        aviso "TAMBIEN BORRA los archivos de sitio/ e intranet/ (uploads y backup) del volumen $VOLUMEN_DE_ARCHIVOS"
        aviso "y deja los del repositorio (filesystem/). cargas-datos y la identidad visual no se tocan. Haz antes: ./docker/deploy.sh backup"
    fi
    read -r -p "Continuar? (s/n): " -n 1 respuesta
    echo
    if [[ ! $respuesta =~ ^[Ss]$ ]]; then
        echo "Cancelado"
        return 0
    fi

    echo ""
    echo "--- 1/5 Esquema al dia (migraciones) ---"
    aplicar_migraciones

    echo ""
    if [ -n "$archivo" ]; then
        echo "--- 2/5 Leyendo las paginas de $archivo ---"
        # Ya trae todo lo que se carga despues (permisos de edicion y las dos tablas) y es
        # del repositorio: no se genera ni se borra.
        volcado="$archivo"
    else
        echo "--- 2/5 Leyendo las paginas del origen ---"
        # Un solo archivo con todo lo que se carga despues, en este orden: los correos de las
        # cuentas del origen y quien podia editar cada pagina (para traducirlos aqui), y las
        # dos tablas. Lleva correos: se borra al terminar, y si la carga falla se avisa.
        volcado="importacion_paginas_$(date +%Y%m%d_%H%M%S).sql"
        {
            echo "COPY pg_temp.origen_usuarios (id, email) FROM stdin;"
            MSYS_NO_PATHCONV=1 docker run --rm "$IMAGEN_CLIENTE_PG" psql "$origen" -v ON_ERROR_STOP=1 -AtXq \
                -c "COPY (SELECT id, email FROM public.usuarios) TO STDOUT" | tr -d '\r' || completo=0
            echo '\.'
            echo "COPY pg_temp.origen_permisos_paginas (clave, rol) FROM stdin;"
            MSYS_NO_PATHCONV=1 docker run --rm "$IMAGEN_CLIENTE_PG" psql "$origen" -v ON_ERROR_STOP=1 -AtXq \
                -c "COPY (SELECT p.clave, r.nombre FROM public.permisos p JOIN public.roles_permisos rp ON rp.permiso_id = p.id JOIN public.roles r ON r.id = rp.rol_id WHERE p.clave LIKE 'editar.%') TO STDOUT" |
                tr -d '\r' || completo=0
            echo '\.'
            # --disable-triggers: deja entrar versiones cuyo autor no es una cuenta de aqui, y la
            # referencia circular paginas <-> paginas_versiones sin importar el orden.
            MSYS_NO_PATHCONV=1 docker run --rm "$IMAGEN_CLIENTE_PG" pg_dump "$origen" \
                --data-only --disable-triggers --no-owner --no-privileges \
                --table=public.paginas --table=public.paginas_versiones || completo=0
        } > "$volcado"
        if [ "$completo" -ne 1 ]; then
            rm -f "$volcado"
            morir "No se pudo leer la base de origen. Revisa ORIGEN_DATABASE_URL y la conexion a internet."
        fi
    fi

    echo ""
    echo "--- 3/5 Cargando (una sola transaccion: si algo falla, no cambia nada) ---"
    # `-o /dev/null`: sin el, psql imprime la fila vacia del `set_config` del volcado. Los
    # errores y el aviso de roles que faltan van por stderr y se siguen viendo.
    if ! cat docker/sql/importar-paginas-antes.sql "$volcado" docker/sql/importar-paginas-despues.sql |
            componer exec -T db psql -q -o /dev/null -v ON_ERROR_STOP=1 --single-transaction -U "$usuario" -d "$base"; then
        [ -n "$archivo" ] ||
            aviso "El volcado sigue en $volcado para revisarlo. Lleva los correos de las cuentas del origen: borralo despues."
        morir "La carga fallo y se deshizo entera: las paginas quedaron como estaban."
    fi
    [ -n "$archivo" ] || rm -f "$volcado"

    echo ""
    echo "--- 4/5 Comparacion: filas en el origen y aqui ---"
    local sql_conteo="SELECT 'paginas', count(*) FROM public.paginas UNION ALL SELECT 'paginas_versiones', count(*) FROM public.paginas_versiones UNION ALL SELECT 'usuarios', count(*) FROM public.usuarios"
    local conteo_origen conteo_destino t o d distintas=0
    if [ -n "$archivo" ]; then
        # Lo que el volcado dice que llevaba cuando se genero. El propio archivo ya comprobo,
        # dentro de la transaccion, que entraron todas; esto lo deja a la vista.
        conteo_origen=$(awk '/^-- conteo:/ { split($3, p, "="); split($4, v, "="); print "paginas", p[2]; print "paginas_versiones", v[2]; exit }' "$archivo" |
            LC_ALL=C sort)
    else
        conteo_origen=$(MSYS_NO_PATHCONV=1 docker run --rm "$IMAGEN_CLIENTE_PG" \
            psql "$origen" -AtF ' ' -c "$sql_conteo" | tr -d '\r' | LC_ALL=C sort)
    fi
    conteo_destino=$(componer exec -T db psql -U "$usuario" -d "$base" -AtF ' ' -c "$sql_conteo" |
        tr -d '\r' | LC_ALL=C sort)
    printf '  %-20s %8s %8s\n' TABLA ORIGEN AQUI
    while read -r t o d; do
        if [ "$t" = usuarios ]; then
            printf '  %-20s %8s %8s  %s\n' "$t" "$o" "$d" "(no viaja: las cuentas de aqui se conservan)"
        elif [ "$o" != "$d" ]; then
            printf '  %-20s %8s %8s  %s\n' "$t" "$o" "$d" "<-- DISTINTO"
            distintas=$((distintas + 1))
        else
            printf '  %-20s %8s %8s\n' "$t" "$o" "$d"
        fi
    done < <(LC_ALL=C join -a1 -a2 -e '-' -o '0,1.2,2.2' <(echo "$conteo_origen") <(echo "$conteo_destino"))

    echo ""
    echo "--- 5/5 Contenido, permisos, cache y archivos ---"
    # El contenido importado entra por SQL, sin pasar por el sanitizador de la API (XSS-08): lo que
    # traiga el origen —un `javascript:` en un boton, un iframe a un sitio ajeno— llegaria a todos
    # tal cual. Se sanea aqui, en la base de destino, antes de que nadie lo vea.
    componer run --rm -T migraciones npm run contenido:revisar -- --aplicar
    # sembrar:permisos quita la clave editar.* de las paginas que ya no existen.
    componer run --rm -T migraciones npm run sembrar:permisos
    # Solo la cache de respuestas (`cache:*`): un FLUSHALL se llevaria tambien la cola de
    # trabajos y los contadores de intentos de acceso de un servidor en uso.
    componer exec -T -e REDISCLI_AUTH="$(leer_env REDIS_PASSWORD)" redis sh -c \
        'redis-cli --scan --pattern "cache:*" | while IFS= read -r clave; do redis-cli DEL "$clave" >/dev/null; done'
    copiar_archivos_al_volumen "sitio intranet" "$sin_respaldos"

    echo ""
    if [ "$distintas" -gt 0 ]; then
        aviso "Hay $distintas tabla(s) de paginas con un numero de filas distinto al del origen: revisalas arriba."
    else
        verde "=== Paginas importadas: coinciden con el origen; los usuarios de aqui siguen intactos ==="
    fi
    echo "El sitio tiene ademas su propia cache de Next, que caduca sola en un minuto."
    [ -n "$archivo" ] || aviso "Cuando termines, borra ORIGEN_DATABASE_URL del $ENV_FILE: es la clave de la base de origen."
}

# El otro extremo de importar-paginas --desde-archivo: se corre en el equipo de DESARROLLO,
# no en el servidor, y no usa Docker ni el .env de aqui. Lee la base a la que apunte
# 4000-api-backend/.env (DATABASE_URL) y escribe el volcado que viaja por git.
exportar_paginas() {
    command -v npm >/dev/null 2>&1 || morir "Hace falta Node/npm: este comando se corre en el equipo de desarrollo."
    [ -f 4000-api-backend/.env ] || morir "No existe 4000-api-backend/.env: sin el no hay a que base conectarse."
    npm --prefix 4000-api-backend run paginas:volcar -- "$@"
    echo ""
    verde "Volcado listo en $ARCHIVO_DE_PAGINAS"
    echo "Siguiente paso: git add $ARCHIVO_DE_PAGINAS && git commit && git push"
    echo "Y en el servidor:  git pull  y  ./docker/deploy.sh importar-paginas --desde-archivo"
}

backup() {
    comprobar_requisitos
    comprobar_entorno

    # Se leen del .env en vez de escribirlos aqui: estaban fijos a 'olo_user'/'olo_db',
    # asi que en cuanto alguien cambiaba POSTGRES_USER el backup fallaba -o peor, volcaba
    # una base distinta de la que la aplicacion estaba usando.
    local usuario base fecha archivo
    usuario=$(leer_env POSTGRES_USER)
    base=$(leer_env POSTGRES_DB)
    fecha=$(date +%Y%m%d_%H%M%S)
    archivo="backup_${base}_${fecha}.sql"

    echo "=== Creando backup: $archivo ==="
    # Sin `-T` docker asigna un pseudo-TTY y mete caracteres de control en el volcado,
    # que luego revienta al restaurarlo.
    componer exec -T db pg_dump -U "$usuario" "$base" > "$archivo"
    verde "Backup guardado en: $archivo"

    # La base sola no es un respaldo completo: las paginas nombran archivos que viven en
    # el volumen, y restaurar una sin los otros deja las imagenes y los PDF rotos. Van
    # con la misma fecha para que se sepa que son pareja.
    local archivos="archivos_${fecha}.tar.gz"
    echo ""
    echo "=== Respaldando los archivos subidos: $archivos ==="
    MSYS_NO_PATHCONV=1 docker run --rm \
        --mount "type=volume,source=$VOLUMEN_DE_ARCHIVOS,target=/filesystem,readonly" \
        --mount "type=bind,source=$(ruta_para_docker .),target=/respaldo" \
        "$IMAGEN_UTILIDADES" tar czf "/respaldo/$archivos" -C /filesystem .
    verde "Archivos guardados en: $archivos"
}

restore_archivos() {
    comprobar_requisitos

    [ -n "${1:-}" ] || morir "Especifica el respaldo. Uso: ./docker/deploy.sh restore-archivos archivos_AAAAMMDD_HHMMSS.tar.gz"
    [ -f "$1" ] || morir "No se encontro el archivo '$1'"

    local respuesta
    echo "=== Restaurando archivos subidos: $1 ==="
    aviso "Se copia el respaldo dentro del volumen $VOLUMEN_DE_ARCHIVOS: lo que tenga el mismo"
    aviso "nombre se sobrescribe y lo demas se conserva. Restaura tambien la base de la misma fecha."
    read -r -p "Continuar? (s/n): " -n 1 respuesta
    echo
    if [[ ! $respuesta =~ ^[Ss]$ ]]; then
        echo "Cancelado"
        return 0
    fi

    MSYS_NO_PATHCONV=1 docker run --rm \
        --mount "type=volume,source=$VOLUMEN_DE_ARCHIVOS,target=/filesystem" \
        --mount "type=bind,source=$(ruta_para_docker "$(dirname "$1")"),target=/respaldo,readonly" \
        "$IMAGEN_UTILIDADES" tar xzf "/respaldo/$(basename "$1")" -C /filesystem
    verde "Archivos restaurados"
}

# Lleva al volumen lo subido que este fuera de el, de dos sitios:
#
#  - `filesystem/` en la raiz del repo: donde guarda la API en desarrollo (`npm run dev`).
#    Solo existe en un equipo de desarrollo; sirve para probar en Docker lo que se hizo
#    alli. Si alguien cambio FILESYSTEM_DIR en el .env de la API, esa otra carpeta no se ve.
#  - Las carpetas de antes del 2026-10-06, montadas entonces en los contenedores: el
#    `public/storage` del sitio y de la intranet, y `uploads/cargas-datos` de la API. Es la
#    mudanza de una sola vez del servidor.
#
# Copia y no mueve, y nunca pisa lo que ya este en el volumen (ver filesystem.ts en la
# API), asi que repetirlo no hace dano: recoge lo que se haya subido entre una vez y otra.
migrar_archivos() {
    comprobar_requisitos
    copiar_archivos_al_volumen "sitio intranet cargas-datos"
}

# El trabajo de migrar-archivos, para las carpetas que se pidan: "sitio intranet" son los
# archivos de las paginas (lo que usa importar-paginas); cargas-datos, los Excel.
copiar_archivos_al_volumen() {
    local carpetas="$1" sin_respaldos="${2:-}"
    local montajes=() par origen destino
    for par in "filesystem:desarrollo" \
               "3000-sitio-web/public/storage:sitio" "3001-intranet/public/storage:intranet" \
               "4000-api-backend/uploads/cargas-datos:cargas-datos"; do
        origen="${par%%:*}"
        destino="${par##*:}"
        [ -d "$origen" ] && montajes+=(--mount "type=bind,source=$(ruta_para_docker "$origen"),target=/origen/$destino,readonly")
    done
    if [ ${#montajes[@]} -eq 0 ]; then
        echo "No hay filesystem/ ni carpetas de antes en el repositorio: nada que copiar."
        return 0
    fi

    echo "=== Copiando los archivos subidos al volumen $VOLUMEN_DE_ARCHIVOS ==="
    # Por defecto nunca pisa ni borra nada; con el 2.º argumento (inicio limpio) deja sitio/ e
    # intranet/ como el repositorio y sin respaldos. El Excel heredado de "Fuentes futuras de empleo" no se copia: es del
    # repositorio y la imagen de la API ya lo trae.
    MSYS_NO_PATHCONV=1 docker run --rm \
        --mount "type=volume,source=$VOLUMEN_DE_ARCHIVOS,target=/filesystem" \
        "${montajes[@]}" \
        -e CARPETAS="$carpetas" -e SIN_RESPALDOS="$sin_respaldos" -e LIMPIAR="$sin_respaldos" \
        "$IMAGEN_UTILIDADES" sh -euc '
            # Archivo por archivo y no `cp -Rn origen/. destino/`: el cp de BusyBox (el de
            # alpine) no copia nada de esa forma si el destino ya existe, sin dar error.
            # El de Git Bash si, y por eso el fallo no se veia al probar fuera de Docker.
            copiar() {
                [ -d "$1" ] || return 0
                ( cd "$1" && find . -type f ) | while IFS= read -r f; do
                    [ -e "$2/$f" ] && continue
                    # Con SIN_RESPALDOS (volcado sin historial) los respaldos de versiones
                    # archivadas no viajan: aqui esas versiones no existen.
                    case "$f" in ./backup/*) [ -n "$SIN_RESPALDOS" ] && continue ;; esac
                    mkdir -p "$2/$(dirname "$f")"
                    cp -p "$1/$f" "$2/$f"
                done
            }
            # Primero el de desarrollo, que ya tiene la estructura del volumen. Se copia
            # carpeta por carpeta para dejar fuera sus marcas `.mudado-*` de la raiz.
            pedida() { case " $CARPETAS " in *" $1 "*) return 0 ;; *) return 1 ;; esac; }
            # Con LIMPIAR (inicio limpio) el volumen queda igual que el repositorio: se vacian
            # uploads/ y backup/ de cada ambito pedido antes de copiar. Solo esas dos carpetas:
            # cargas-datos y panel (la identidad visual) no se tocan. Si el repositorio no trae
            # ningun archivo de ese ambito (un `git pull` incompleto), no se borra nada: dejaria
            # las paginas sin sus imagenes.
            if [ -n "$LIMPIAR" ]; then
                for ambito in sitio intranet; do
                    pedida "$ambito" || continue
                    if [ -z "$(find /origen/desarrollo/$ambito/uploads /origen/$ambito/uploads -type f 2>/dev/null | head -n1)" ]; then
                        echo "  · $ambito: el repositorio no trae archivos, no se limpia"
                        continue
                    fi
                    for sub in uploads backup; do
                        [ -d "/filesystem/$ambito/$sub" ] || continue
                        echo "  · $ambito/$sub: $(find "/filesystem/$ambito/$sub" -type f | wc -l) archivo(s) del volumen se borran"
                        find "/filesystem/$ambito/$sub" -mindepth 1 -delete
                    done
                done
            fi
            for d in sitio intranet cargas-datos; do
                if pedida "$d"; then copiar "/origen/desarrollo/$d" "/filesystem/$d"; fi
            done
            for ambito in sitio intranet; do
                pedida "$ambito" || continue
                copiar "/origen/$ambito/uploads" "/filesystem/$ambito/uploads"
                [ -n "$SIN_RESPALDOS" ] || copiar "/origen/$ambito/backup" "/filesystem/$ambito/backup"
            done
            if pedida cargas-datos && [ -d /origen/cargas-datos ]; then
                mkdir -p /filesystem/cargas-datos
                for f in /origen/cargas-datos/*; do
                    [ -f "$f" ] || continue
                    [ "$(basename "$f")" = fuentes-futuras-de-empleo.xlsx ] && continue
                    cp -n "$f" /filesystem/cargas-datos/
                done
            fi
            echo ""
            echo "Archivos en el volumen, por carpeta:"
            for d in sitio/uploads sitio/backup intranet/uploads intranet/backup cargas-datos; do
                [ -d "/filesystem/$d" ] || continue
                printf "  %-18s %5s\n" "$d" "$(find "/filesystem/$d" -type f | wc -l)"
            done
        '
    echo ""
    verde "Copia terminada. Los origenes quedan como estaban. Las carpetas de antes se pueden"
    verde "vaciar cuando compruebes que las paginas ven sus imagenes y PDF (ver docker/guia-bash.md);"
    verde "filesystem/ no: es donde guarda la API en desarrollo."
}

restore() {
    comprobar_requisitos
    comprobar_entorno

    [ -n "${1:-}" ] || morir "Especifica el archivo de backup. Uso: ./docker/deploy.sh restore backup.sql"
    [ -f "$1" ] || morir "No se encontro el archivo '$1'"

    local usuario base respuesta
    usuario=$(leer_env POSTGRES_USER)
    base=$(leer_env POSTGRES_DB)

    echo "=== Restaurando backup: $1 ==="
    aviso "Esto sobrescribira la base de datos '$base'. No se puede deshacer."
    read -r -p "Continuar? (s/n): " -n 1 respuesta
    echo
    if [[ ! $respuesta =~ ^[Ss]$ ]]; then
        echo "Cancelado"
        return 0
    fi

    # `ON_ERROR_STOP=1` para que un volcado corrupto no deje la base a medio restaurar
    # informando de exito: sin esto psql sigue tras cada error y termina con codigo 0.
    componer exec -T db \
        psql -v ON_ERROR_STOP=1 -U "$usuario" "$base" < "$1"
    verde "Backup restaurado"
}

case "${1:-help}" in
    setup)   setup ;;
    start)   start ;;
    stop)    stop ;;
    restart) restart ;;
    logs)    logs ;;
    status)  status ;;
    build)   build ;;
    migrar)  migrar ;;
    sembrar) sembrar ;;
    importar) importar ;;
    importar-paginas) shift; importar_paginas "$@" ;;
    exportar-paginas) shift; exportar_paginas "$@" ;;
    crear-admin) crear_admin ;;
    retirar-rol) shift; retirar_rol "$@" ;;
    backup)  backup ;;
    restore) restore "${2:-}" ;;
    restore-archivos) restore_archivos "${2:-}" ;;
    migrar-archivos)  migrar_archivos ;;
    help|*)  show_help ;;
esac

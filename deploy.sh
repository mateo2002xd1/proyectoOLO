#!/usr/bin/env bash
# Script de despliegue del OLO.
# Uso: ./deploy.sh [comando]
#
# Por defecto opera sobre `docker-compose.prod.yml`. Para levantar la pila de
# desarrollo (sin nginx ni SSL, con los puertos publicados directamente):
#
#   COMPOSE_FILE=docker-compose.yml ./deploy.sh start

set -Eeuo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE=".env"

# `docker-compose.prod.yml` es el unico que monta nginx y por tanto el unico que
# necesita dominios y contrasena de Redis.
ES_PRODUCCION=false
[[ "$COMPOSE_FILE" == *prod* ]] && ES_PRODUCCION=true

# Cada uno de estos tumba un contenedor si llega vacio: la API aborta el arranque sin
# `JWT_SECRET`, Postgres no inicializa sin contrasena, y nginx levanta con un
# `server_name` vacio que no casa con ningun dominio.
VARIABLES_REQUERIDAS=(POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD JWT_SECRET REVALIDAR_SECRET)
$ES_PRODUCCION && VARIABLES_REQUERIDAS+=(REDIS_PASSWORD SITIO_WEB_DOMAIN INTRANET_DOMAIN)

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
componer() { MSYS_NO_PATHCONV=1 docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"; }

show_help() {
    cat <<'AYUDA'
============================================
  OLO Proyect - Script de Despliegue
============================================

Uso: ./deploy.sh [comando]

Comandos:
  setup     - Primera configuracion (crear .env, generar secretos, construir)
  start     - Iniciar todos los servicios
  stop      - Detener todos los servicios
  restart   - Reiniciar todos los servicios
  logs      - Ver logs en tiempo real
  status    - Ver estado de los servicios
  build     - Reconstruir imagenes
  migrar    - Aplicar las migraciones de esquema pendientes
  sembrar   - Cargar el contenido inicial (paginas, identidad visual)
  crear-admin - Crear la primera cuenta de Superadmin (solo instalacion nueva)
  backup    - Backup de la base de datos
  restore   - Restaurar backup (uso: ./deploy.sh restore backup.sql)
  ssl       - Emitir certificado (uso: ./deploy.sh ssl dominio.com email@dominio.com)
  renovar   - Renovar los certificados ya emitidos
  help      - Mostrar esta ayuda

Variables de entorno:
  COMPOSE_FILE   Archivo compose a usar (por defecto docker-compose.prod.yml)
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
}

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
    [ -f "$ENV_FILE" ] || morir "No existe '$ENV_FILE'. Ejecuta primero: ./deploy.sh setup"

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
# Antes eran pasos manuales (ver 7-despliegue.md); van aqui para que ningun empaquetado
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
        echo "Editalo (nano $ENV_FILE) y vuelve a ejecutar: ./deploy.sh setup"
        exit 0
    fi

    echo ""
    echo "=== Construyendo imagenes ==="
    componer build

    echo ""
    verde "=== Setup completado ==="
    echo "Ejecuta: ./deploy.sh start"
    if $ES_PRODUCCION; then
        echo "Y despues, para el certificado: ./deploy.sh ssl <dominio> <email>"
    fi
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
    verde "Servicios iniciados. Verifica con: ./deploy.sh status"

    # nginx no arranca si `ssl_certificate` apunta a un archivo que no existe, asi que
    # sin certificado la pila queda arriba pero inalcanzable desde fuera. Avisarlo aqui
    # ahorra tener que deducirlo de un contenedor reiniciandose en bucle.
    if $ES_PRODUCCION; then
        if ! componer ps nginx 2>/dev/null | grep -qi "running\|up"; then
            echo ""
            aviso "nginx no esta arriba. Si aun no has emitido el certificado:"
            aviso "  ./deploy.sh ssl $(leer_env SITIO_WEB_DOMAIN) tu-correo@dominio.com"
        fi
    fi
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
    componer build --no-cache
    echo ""
    verde "Imagenes reconstruidas. Ejecuta: ./deploy.sh restart"
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

SEED="api-backend/seed/contenido-inicial.sql"
SEED_ROLES="api-backend/seed/roles-y-permisos.sql"

sembrar() {
    comprobar_requisitos
    comprobar_entorno

    [ -f "$SEED" ] || morir "No existe '$SEED'. Regeneralo con: npm run seed:generar (en api-backend/)"

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
}

restore() {
    comprobar_requisitos
    comprobar_entorno

    [ -n "${1:-}" ] || morir "Especifica el archivo de backup. Uso: ./deploy.sh restore backup.sql"
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

ssl() {
    comprobar_requisitos
    comprobar_entorno
    if [ -z "${1:-}" ] || [ -z "${2:-}" ]; then
        echo "Uso: ./deploy.sh ssl <dominio> <email> [dominio-extra ...]"
        echo "Ejemplo: ./deploy.sh ssl tusitio.com admin@tusitio.com www.tusitio.com"
        exit 1
    fi
    ./init-ssl.sh "$@"
}

renovar() {
    comprobar_requisitos
    comprobar_entorno
    echo "=== Renovando certificados ==="
    componer run --rm -T certbot renew --webroot -w /var/www/certbot
    # nginx solo lee los certificados al arrancar o al recargar: sin esto seguiria
    # sirviendo el certificado viejo hasta el proximo reinicio.
    componer exec -T nginx nginx -s reload
    verde "Certificados renovados y nginx recargado"
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
    crear-admin) crear_admin ;;
    backup)  backup ;;
    restore) restore "${2:-}" ;;
    ssl)     shift; ssl "$@" ;;
    renovar) renovar ;;
    help|*)  show_help ;;
esac

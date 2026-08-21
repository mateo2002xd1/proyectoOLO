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
    docker compose -f "$COMPOSE_FILE" build

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
    echo "=== Iniciando servicios ==="
    docker compose -f "$COMPOSE_FILE" up -d
    echo ""
    verde "Servicios iniciados. Verifica con: ./deploy.sh status"

    # nginx no arranca si `ssl_certificate` apunta a un archivo que no existe, asi que
    # sin certificado la pila queda arriba pero inalcanzable desde fuera. Avisarlo aqui
    # ahorra tener que deducirlo de un contenedor reiniciandose en bucle.
    if $ES_PRODUCCION; then
        if ! docker compose -f "$COMPOSE_FILE" ps nginx 2>/dev/null | grep -qi "running\|up"; then
            echo ""
            aviso "nginx no esta arriba. Si aun no has emitido el certificado:"
            aviso "  ./deploy.sh ssl $(leer_env SITIO_WEB_DOMAIN) tu-correo@dominio.com"
        fi
    fi
}

stop() {
    comprobar_requisitos
    echo "=== Deteniendo servicios ==="
    docker compose -f "$COMPOSE_FILE" down
}

restart() {
    comprobar_requisitos
    echo "=== Reiniciando servicios ==="
    docker compose -f "$COMPOSE_FILE" restart
}

logs()   { comprobar_requisitos; docker compose -f "$COMPOSE_FILE" logs -f; }
status() { comprobar_requisitos; docker compose -f "$COMPOSE_FILE" ps; }

build() {
    comprobar_requisitos
    echo "=== Reconstruyendo imagenes ==="
    docker compose -f "$COMPOSE_FILE" build --no-cache
    echo ""
    verde "Imagenes reconstruidas. Ejecuta: ./deploy.sh restart"
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
    docker compose -f "$COMPOSE_FILE" exec -T db pg_dump -U "$usuario" "$base" > "$archivo"
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
    docker compose -f "$COMPOSE_FILE" exec -T db \
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
    docker compose -f "$COMPOSE_FILE" run --rm certbot renew --webroot -w /var/www/certbot
    # nginx solo lee los certificados al arrancar o al recargar: sin esto seguiria
    # sirviendo el certificado viejo hasta el proximo reinicio.
    docker compose -f "$COMPOSE_FILE" exec nginx nginx -s reload
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
    backup)  backup ;;
    restore) restore "${2:-}" ;;
    ssl)     shift; ssl "$@" ;;
    renovar) renovar ;;
    help|*)  show_help ;;
esac

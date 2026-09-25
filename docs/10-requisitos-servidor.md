# Requisitos de Software — Servidor de Preproducción OLO (SENA)

---

## 1. Software principal a instalar en el servidor

El sistema está **completamente contenedorizado con Docker**. Eso significa que en el servidor **solo se instalan dos programas**; el resto (base de datos, caché, proxy, Node.js) corren como contenedores y no requieren instalación manual.

| # | Software | Versión mínima recomendada | Propósito |
|---|---|---|---|
| 1 | **Docker Engine** | 26.x (Community Edition) | Motor de contenedores — ejecuta los servicios de la plataforma |
| 2 | **Docker Compose** | 2.27.x (plugin integrado) | Orquestación de los contenedores del proyecto |

> **Nota:** A partir de Docker Engine 23+, Docker Compose viene incluido como plugin (`docker compose`). No es necesario instalar la versión independiente `docker-compose` (v1, obsoleta).

---

## 2. Imágenes Docker que el sistema descarga y ejecuta automáticamente

Estas no se instalan en el sistema operativo: Docker las descarga al hacer el primer despliegue.

| Servicio | Imagen Docker | Versión exacta | Propósito |
|---|---|---|---|
| **API Backend** | `node` | `20-alpine` | Runtime Node.js 20 LTS para la API REST (Express 5) |
| **Sitio web** | `node` | `20-alpine` | Runtime Node.js 20 LTS para el portal público (Next.js 16) |
| **Intranet** | `node` | `20-alpine` | Runtime Node.js 20 LTS para la intranet de directores (Next.js 16) |
| **Base de datos** | `postgres` | `16-alpine` | PostgreSQL 16 — almacenamiento de datos principal |
| **Caché / Colas** | `redis` | `7-alpine` | Redis 7 — caché de páginas públicas y colas de trabajos (BullMQ) |
| **Proxy / SSL** | `nginx` | `alpine` (latest stable) | Nginx — reverse proxy, terminación SSL/TLS, enrutamiento de dominios |
| **Certificados SSL** | `certbot/certbot` | `latest` | Let's Encrypt — emisión y renovación automática de certificados HTTPS |

---

## 3. Requisitos de red y sistema operativo

| Elemento | Requerimiento |
|---|---|
| **Sistema operativo** | Linux (Ubuntu 22.04 LTS o Debian 12 recomendados) |
| **Puertos abiertos** | 80 (HTTP) y 443 (HTTPS) — expuestos al exterior vía Nginx |
| **Puertos internos** | 3000, 3001, 4000, 5432, 6379 — solo entre contenedores, no expuestos al exterior en producción |
| **Acceso SSH** | Requerido para despliegue y administración |
| **DNS** | Dos registros tipo A apuntando a la IP del servidor: sitio público e intranet |
| **Espacio en disco** | Mínimo 20 GB recomendados (imágenes + datos + backups + logs) |
| **RAM** | Mínimo 4 GB recomendados para los 6 contenedores simultáneos |

---

## 4. Paquetes y librerías adicionales del servidor

Al ser una arquitectura Docker pura, **no se instalan librerías adicionales en el sistema operativo host**. Todas las dependencias de la aplicación están declaradas en los archivos `package.json` de cada proyecto y se instalan **dentro de las imágenes** durante el proceso de build (`npm ci`).

Las dependencias de producción principales que se instalan automáticamente dentro de los contenedores son:

### API Backend (dentro del contenedor `api`)

| Librería | Versión | Propósito |
|---|---|---|
| `express` | ^5.1.0 | Framework HTTP |
| `sequelize` + `pg` | ^6.37.5 / ^8.13.1 | ORM + driver PostgreSQL |
| `zod` | ^3.24.1 | Validación de datos de entrada |
| `jsonwebtoken` | ^9.0.2 | Autenticación JWT |
| `bcryptjs` | ^3.0.3 | Hash de contraseñas |
| `bullmq` + `ioredis` | ^5.80.5 / ^5.4.2 | Colas de trabajos + cliente Redis |
| `helmet` | ^8.0.0 | Headers de seguridad HTTP |
| `express-rate-limit` | ^8.5.2 | Límite de tasa de peticiones |

### Sitio web e Intranet (dentro de sus contenedores)

| Librería | Versión | Propósito |
|---|---|---|
| `next` | ^16.3.0 | Framework React fullstack (App Router) |
| `react` / `react-dom` | 19.2.4 | Interfaz de usuario |
| `@puckeditor/core` | ^0.22.x | Editor visual de páginas |
| `jose` | ^6.2.3 | Manejo de JWT en el edge runtime |
| `tailwindcss` | ^4 | Estilos CSS (compilado en build, no en runtime) |

---

## 5. Resumen

Para instalar el sistema en el servidor de preproducción **solo se requiere**:

Instalar **Docker Engine 26+** con el plugin **Docker Compose 2.27+**
Abrir los puertos **80** y **443** en el firewall
Configurar dos registros **DNS tipo A** (sitio web e intranet)
Clonar el repositorio y ejecutar el script de despliegue: `./docker/deploy.sh setup && ./docker/deploy.sh start`

Todo lo demás (Node.js, PostgreSQL, Redis, Nginx, certificados SSL, dependencias npm) se instala y configura **automáticamente** a través de Docker.

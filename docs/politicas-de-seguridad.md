# Políticas de Seguridad - Proyecto OLO

Este documento consolida las estrategias, patrones y políticas de seguridad actualmente implementadas en el ecosistema (Backend, Base de Datos, y conexión con el Frontend) del proyecto OLO, así como recomendaciones de mejora a futuro.

## 1. Arquitectura y Base de Datos

* **Conexiones Encriptadas (SSL):**
  La conexión entre la API y la base de datos (PostgreSQL/Neon) fuerza por defecto el uso de SSL (`ssl: { require: true }`) para garantizar que los datos viajen encriptados. Además, el ORM tiene el logging desactivado en consola (`logging: false`) para evitar imprimir contraseñas en sentencias SQL.
* **Identificadores Inadivinables (UUIDv4):**
  Todas las tablas principales utilizan `UUIDv4` como clave primaria en lugar de IDs auto-incrementales. Esto mitiga ataques de enumeración de recursos.
* **Bitácora de Auditoría (Audit Log):**
  Se mantiene un registro inmutable en la tabla `auditoria_cambios` (`ContentAuditLog`), almacenando los cambios exactos de estado, quién los ejecutó, la dirección IP y el `User-Agent`.
* **Sanitización y Validación Estricta (Zod):**
  Ninguna petición alcanza la lógica de negocio ni la base de datos sin antes ser validada por middlewares que verifican que la estructura coincida estrictamente con esquemas declarados en `Zod` (DTOs).

## 2. Autenticación, Control de Acceso y Frontend (BFF)

* **Proxy de Intermediación (Backend For Frontend - BFF):**
  Las páginas públicas en Next.js (Sitio Web e Intranet) no comunican al cliente web directamente con la API en rutas protegidas. El servidor de Next.js actúa como proxy (BFF), inyectando de forma segura el token y ocultando la URL real del backend (`BACKEND_URL`).
* **JSON Web Tokens (JWT) en Cookies HttpOnly:**
  El JWT se almacena de forma segura en las *cookies* del servidor de Next.js (`AUTH_COOKIE_NAME`). Al no exponerse al `localStorage` del cliente, se previene el robo del token ante ataques XSS en el frontend.
* **Control de Autorización (RBAC y Policies):**
  El sistema cuenta con un control de acceso basado en roles y políticas (`policies/`). Middlewares como `permisos.middleware.ts` bloquean accesos horizontales y previenen la escalada de privilegios.
* **Prevención de Fuerza Bruta (Rate Limiting Avanzado):**
  La API cuenta con `rate-limit.middleware.ts` respaldado por **Redis**. Extrae cabeceras como `X-Forwarded-For` generadas detrás del BFF y cuenta las peticiones por **ID de Usuario** para rutas autenticadas.
* **CORS Estricto:**
  El servidor backend rechaza peticiones desde cualquier origen no autorizado (`*`). El CORS está estrictamente limitado a las URLs oficiales de Next.js.

## 3. Gestión de Cuentas, Contraseñas y Archivos

* **Hashing de Contraseñas y Preguntas de Seguridad:**
  Ni las contraseñas ni las respuestas de seguridad se almacenan en texto plano; ambas se guardan únicamente como firmas encriptadas (`password_hash`, `answer_hash`).
* **Bloqueo Automático (Account Lockout) y Caducidad:**
  La cuenta mantiene contadores de fallos separados. Al exceder el umbral, se inactiva temporalmente (`locked_until`). También soporta una caducidad total de la cuenta (`expiration_date`).
* **Políticas de Primer Ingreso (Forzado):**
  Las cuentas recién creadas son forzadas a personalizar su contraseña y preguntas de seguridad antes de consumir la API.
* **Minimización de Datos (Archivos Huérfanos):**
  Para la carga y descarga de archivos (imágenes/documentos), el sistema cuenta con un proceso de recolección (`borrarArchivosHuerfanos`) que depura de forma segura archivos no referenciados, evitando fugas de información antigua o almacenamiento masivo no deseado.

## 4. Resiliencia de Infraestructura y Entorno (Defense in Depth)

Desde la perspectiva de arquitectura, el proyecto cuenta con defensas a nivel de entorno (`config/index.ts`):

* **Fail-Fast de Secretos (JWT_SECRET):**
  Si el entorno no inyecta el `JWT_SECRET`, el servicio crashea intencionalmente en el arranque (`throw new Error`) en lugar de iniciar vulnerable.
* **Killswitch de Cuentas Maestras (Backdoor Prevention):**
  Aunque existe una cuenta Superadmin local (`LOCAL_AUTH_EMAIL`) para desarrollo, el código la **inactiva forzosamente** si detecta que `NODE_ENV=production`, evitando puertas traseras públicas.
* **Ofuscación de Superficie (Swagger UI):**
  La documentación interactiva de la API se apaga automáticamente en entornos de producción.

---

## 5. Posibles Mejoras (Fáciles de implementar, sin afectar rendimiento)

1. **Implementar Helmet.js:**
   Agregar el middleware `helmet` en `app.ts` inyecta un set estándar de cabeceras de seguridad HTTP de manera automática (ej. X-Content-Type-Options, HSTS).
2. **Validación de Contraseñas Comprometidas (Have I Been Pwned):**
   Al momento de cambiar la contraseña, el backend podría consultar (sin exponer la clave) si esta pertenece a listas de filtraciones conocidas en internet.
3. **Acortar el TTL (Time-to-Live) de los JWT:**
   Reducir la vida útil del token a minutos e implementar *Refresh Tokens* opacos y rotativos almacenados en la base de datos para manejar la persistencia de la sesión.
4. **Autenticación Multi-Factor (MFA / TOTP):**
   Ofrecer el uso de aplicaciones como Google Authenticator en lugar de depender únicamente de las Preguntas de Seguridad.

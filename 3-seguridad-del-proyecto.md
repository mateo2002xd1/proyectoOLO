# Seguridad — Proyecto OLO (SENA)

> Documento complementario a `1-guia-del-proyecto.md`. Modelo de amenazas por superficie y controles concretos. Como es un portal gubernamental que maneja datos personales (Ley 1581) y ofrece edición con roles, la seguridad no es opcional.

---

## 0. Principios rectores

1. **La API es la única frontera de confianza.** Todo lo que llega del navegador es hostil hasta validarse. Ningún control de seguridad vive solo en el frontend.
2. **Defensa en profundidad.** Cada operación sensible se protege en varias capas (ruta + policy + validación), para que un fallo en una no exponga el sistema.
3. **Mínimo privilegio.** Cada rol accede solo a lo estrictamente necesario. Por defecto se niega; se permite explícitamente.
4. **Nunca confiar en el cliente para autorizar.** El JWT en el frontend solo se decodifica para UX; la firma se valida siempre en la API.

---

## 1. Superficies de ataque y su riesgo

| # | Superficie | Riesgo principal | Severidad |
|---|---|---|---|
| S1 | Subida de archivos (RF-02) | Ejecución de código, malware, path traversal | **Crítica** |
| S2 | Editor.js / contenido HTML (RF-01) | XSS almacenado | **Crítica** |
| S3 | Autenticación y sesiones (RF-16) | Robo de sesión, fuerza bruta | Alta |
| S4 | RBAC / autorización (RF-04, RF-05) | Escalada de privilegios | Alta |
| S5 | API key externa CNO/CUOC (RF-09) | Filtración de credencial | Alta |
| S6 | Contenedores Power BI / iframes (RF-08) | Clickjacking, contenido malicioso | Media |
| S7 | Formularios con datos personales (RF-13) | Incumplimiento Ley 1581, inyección | Alta |
| S8 | Descarga pública (RF-12) | Acceso a documentos no publicados | Media |
| S9 | Respaldos (RF-17) | Exposición de la copia completa de datos | Alta |

---

## 2. Controles por superficie

### S1 — Subida de archivos CRÍTICO (hoy el `storage` es un stub)

Este es el vector más peligroso del proyecto y está sin implementar. Al construir `shared/storage`:

- **Validar el tipo real, no la extensión ni el `Content-Type`** declarado (ambos se falsifican). Inspeccionar los *magic bytes* del archivo.
- **Lista blanca estricta** de tipos permitidos (PDF, xlsx, JPG, PNG, SVG) — nunca lista negra.
- **SVG es peligroso**: puede contener `<script>` y ejecutar XSS al renderizarse. Sanitizar SVG (quitar scripts/handlers) o servirlo siempre con `Content-Disposition: attachment` y `Content-Security-Policy` restrictiva, nunca inline en el DOM.
- **Tamaño máximo configurable** verificado en el servidor (no solo en el cliente).
- **Renombrar el archivo** a un identificador generado (UUID); nunca usar el nombre original en el path (evita path traversal como `../../etc/passwd`).
- **Almacenar fuera del webroot** o en almacenamiento de objetos; servir mediante un endpoint controlado, no exponiendo el directorio.
- **Escanear con antivirus** si el volumen lo justifica (ClamAV).
- **Nota sobre el upload actual**: el `/api/upload` de los frontends hoy escribe directo a `public/uploads` sin validación — esto debe migrarse a la API central con todos los controles anteriores antes de producción.

### S2 — XSS del contenido (Editor.js) CRÍTICO

El contenido rico que crean los editores es HTML almacenado que luego se renderiza a otros usuarios. Sin sanitización, un editor malicioso (o una cuenta comprometida) inyecta scripts que se ejecutan en el navegador de todos.

- **Sanitizar en el servidor** al guardar (no confiar en sanitización solo de cliente): lista blanca de etiquetas y atributos permitidos (DOMPurify en el backend, o equivalente).
- **Nunca `dangerouslySetInnerHTML`** con contenido sin sanitizar.
- **Content-Security-Policy** que bloquee scripts inline y orígenes no confiables — mitiga el XSS aunque algo se escape.
- Aplica igual al contenido de bloques Puck que acepten texto libre.

### S3 — Autenticación y sesiones (RF-16)

- **Contraseñas con bcrypt** (ya está) — coste de hashing adecuado (≥ 10 rounds).
- **Política de complejidad concreta**: definir longitud mínima, mezcla de caracteres. Hoy el requerimiento la menciona pero no está especificada — hay que escribirla.
- **JWT**: firma verificada solo en la API. Tokens con expiración corta. Guardar en cookie `httpOnly`, `Secure`, `SameSite` — nunca en `localStorage` (accesible por XSS).
- **Rate limiting en login** (ya hay `express-rate-limit`): limitar intentos por IP/usuario para frenar fuerza bruta. Endpoints de recuperación y preguntas de seguridad también.
- **Caducidad de cuentas (RF-16)**: hoy en STUB. Al implementar, la verificación de caducidad debe ocurrir en el login del backend, no en el frontend.
- **First-login y preguntas de seguridad**: ya implementados; verificar que el flujo no permita saltarse el cambio de contraseña obligatorio.

### S4 — RBAC / autorización (RF-04, RF-05, RF-06)

- **Doble capa**: middleware de ruta (`require-permission`) + policy en el use-case. Un endpoint administrativo nunca depende de un solo control.
- **Verificar en cada operación sensible**, no solo al entrar a una sección. Que un Editor no pueda llamar directamente al endpoint de aprobar aunque no vea el botón.
- **Hallazgo de auditoría a cerrar**: el código original tenía "RBAC definido en BD pero nunca aplicado en código". Confirmar que hoy TODA ruta administrativa aplica `require-permission`, no solo `requireAuth`.
- **El frontend oculta, el backend prohíbe**: esconder un botón es UX; la seguridad real es que la API rechace la operación.

### S5 — API key externa CNO/CUOC (RF-09)

- **La API key nunca sale al frontend.** El navegador llama a la API del OLO, y la API del OLO llama a la CNO con la key. La key vive solo en variables de entorno del backend.
- **Nunca commitear la key**; en `.env`, fuera del control de versiones.
- **Validar y limitar** las consultas que se reenvían a la CNO (evitar que el buscador se use para abusar de la API externa).

### S6 — Contenedores Power BI / iframes (RF-08)

- **Lista blanca de dominios** permitidos para incrustar (Power BI oficial, dominios SENA autorizados) — no permitir cualquier URL.
- **Validar la URL en el servidor** antes de guardarla (esquema `https`, dominio permitido).
- **`sandbox` en los iframes** y CSP `frame-src` restrictiva.
- Mitiga clickjacking y evita que un editor incruste contenido arbitrario.

### S7 — Formularios con datos personales (RF-13, Ley 1581)

- **Aceptación explícita registrada** (fecha, hora, identificador) — no marcada por defecto.
- **Validación y sanitización** de toda entrada de formulario en el servidor (Zod).
- **No registrar datos personales en logs** ni en mensajes de error.
- **Aviso de privacidad** con enlace a la política del SENA, versión vigente de la Ley 1581/2012.

### S8 — Descarga pública (RF-12)

- **Solo documentos con estado `publicado`** son descargables públicamente. Un documento en borrador o revisión nunca debe ser accesible por URL directa.
- **No confiar en URLs adivinables**: verificar el estado del contenido en el endpoint de descarga, no solo servir el archivo por path.

### S9 — Respaldos (RF-17)

- **Cifrar los respaldos** en reposo; contienen la base completa.
- **Almacenar en ubicación separada y con acceso restringido** (no en el mismo servidor sin protección).
- **Registrar y verificar** cada respaldo; probar la restauración periódicamente (un respaldo que no se puede restaurar no es un respaldo).

---

## 3. Controles transversales (toda la plataforma)

- **Headers de seguridad**: Helmet ya está; endurecer con CSP explícita, `X-Frame-Options`, `Strict-Transport-Security` (HSTS) en producción.
- **HTTPS obligatorio** en producción (Nginx + Let's Encrypt, ya contemplado); redirigir todo HTTP a HTTPS.
- **CORS restringido** a los orígenes de los frontends (ya configurado: `frontendUrl`, `intranetUrl`) — no `*`.
- **Rate limiting** por endpoint sensible, no solo login.
- **Validación de entrada con Zod** en todo endpoint que reciba datos.
- **Logs sin datos sensibles**: nunca loguear contraseñas, tokens, ni datos personales.
- **Dependencias**: `npm audit` en CI; mantener actualizadas las librerías con parches de seguridad.
- **Secretos en variables de entorno**, nunca en el código ni en el repo. `.env` en `.gitignore` (ya está).

---

## 4. Checklist de seguridad por requerimiento

| RF | Control obligatorio antes de producción |
|---|---|
| RF-01 | Sanitizar HTML de Editor.js en el servidor |
| RF-02 | Validar magic bytes, sanitizar SVG, renombrar a UUID, tamaño en servidor, fuera del webroot |
| RF-04/05/06 | Doble capa RBAC (ruta + policy) aplicada en TODA operación sensible |
| RF-08 | Lista blanca de dominios de iframe + validación de URL en servidor + sandbox |
| RF-09 | API key solo en backend, nunca expuesta al frontend |
| RF-12 | Verificar estado `publicado` en el endpoint de descarga |
| RF-13 | Aceptación registrada + sanitización + aviso Ley 1581 vigente |
| RF-16 | Caducidad verificada en backend, cookies httpOnly/Secure, política de contraseña definida, rate limiting |
| RF-17 | Respaldos cifrados, ubicación restringida, restauración probada |

---

## 5. Prioridad de implementación (por severidad)

```
1. S1 Subida de archivos      → CRÍTICO, además hoy es un stub (bloquea RF-02 de forma segura)
2. S2 XSS Editor.js           → CRÍTICO, cada contenido publicado es un vector potencial
3. S4 RBAC aplicado de verdad → cerrar el hallazgo de auditoría
4. S3 Auth + caducidad        → completar el stub de caducidad con verificación server-side
5. S5 API key externa         → al construir el buscador CNO
6. S7/S8/S6/S9                → conforme se implementen sus requerimientos
```

> Regla de oro: ningún requerimiento se considera "terminado" hasta que pasa su fila del checklist de la sección 4. "Funciona" no es lo mismo que "es seguro".

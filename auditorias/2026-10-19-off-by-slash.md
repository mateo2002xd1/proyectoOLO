# Prueba de off-by-slash — OLO

- **Fecha:** 2026-10-19
- **Autor:** ingdave (con Claude Code)
- **Alcance:** el camino de una URL desde el túnel hasta el disco: nginx (`docker/nginx/nginx.servidor.conf`) → `next.config` y `proxy.ts` de sitio e intranet → rutas de Express → resolución de rutas en disco de la API (`infrastructure/storage/`). También las comprobaciones de «empieza por `/`» de los `?redirect=` del login.
- **Tipo:** seguridad defensiva sobre nuestra propia aplicación. Sobre todo análisis de configuración y código; las pocas pruebas en vivo que se ejecutaron fueron peticiones `GET` sin sesión contra el `next dev` local y comprobaciones con el analizador de URL de Node.
- **Commit revisado:** `1cb44bad` (rama `dev`).

---

## Veredicto

**El off-by-slash clásico de nginx no existe en el OLO**: no hay ninguna directiva `alias` y cada `location` de prefijo con `proxy_pass` termina en `/` igual que la URI a la que reenvía. La comprobación de contención con la que la API sirve los archivos está bien hecha (`base + path.sep`).

Aun así, la revisión encontró **tres fallos de la misma familia** («a la comprobación de prefijo le falta la barra o la frontera») y una observación fuera de alcance:

| # | Dónde | Qué pasa | Gravedad | Cómo se comprobó |
|---|---|---|---|---|
| H1 | `backup-uploads.service.ts` (publicar y restaurar) | Las rutas `/uploads/...` que se sacan del contenido de una página se resuelven **sin comprobar que sigan dentro de `uploads/`**. | **Media-alta** | Código (la prueba en vivo no se ejecutó, ver «Limitaciones») |
| H2 | `login-view.tsx` de sitio e intranet | El filtro del `?redirect=` descarta `//` pero no `/\` ni `/<tab>/`: **redirección abierta** después del login. | **Media** | Código + analizador de URL de Node |
| H3 | `3001-intranet/src/proxy.ts:71` | `startsWith('/api-backend')` sin barra final: cualquier ruta que empiece por `/api-backend…` **se salta la exigencia de sesión**. | **Baja** | Código + petición en vivo al `next dev` |
| O1 | `GET /api/paginas/publica/:slug` | Sin sesión y con la cabecera `X-Ambito: intranet` se lee el contenido publicado de la intranet. **No es off-by-slash**, pero apareció siguiendo H3. | **Alta** (a confirmar) | Código |

---

## Qué es el off-by-slash (la analogía)

Imagina un archivador con un cajón llamado `fotos/`. El conserje tiene una regla: «a quien pida algo que empiece por **fotos**, le abro el cajón `fotos/` y le doy lo que siga». Si la regla dice `fotos` (sin barra) en vez de `fotos/`, alguien pide `fotos../contabilidad/nómina.pdf`: «empieza por fotos», así que el conserje abre `fotos/` + `../contabilidad/nómina.pdf`… y sale del cajón.

En nginx es exactamente eso:

```nginx
location /static {            # sin barra
    alias /var/www/static/;   # con barra
}
# GET /static../app/.env  →  /var/www/static/../app/.env  →  /var/www/app/.env
```

El mismo error aparece fuera de nginx con otras formas, y por eso se revisaron también:

- **En código:** `ruta.startsWith(base)` en vez de `ruta.startsWith(base + path.sep)`. Con `base = /fs/uploads`, la ruta `/fs/uploads-viejo/x` pasa el filtro.
- **En middlewares de acceso:** `pathname.startsWith('/api')` también deja pasar `/apiloquesea`.
- **En redirecciones:** «empieza por `/`, así que es de este sitio» olvida que el navegador lee `//host`, `/\host` y `/<tab>/host` como **otro sitio**.

---

## Metodología

1. **nginx:** se leyó cada `location` y su `proxy_pass` buscando `alias`, `root`, prefijos sin barra y desajustes de barra entre `location` y `proxy_pass`.
2. **Next (`next.config`):** se revisaron los `rewrites` con `:path*` y adónde llevan en la API.
3. **Middlewares (`proxy.ts`):** se revisó cada `startsWith`/`===` que decide si una ruta exige sesión, y el `matcher`.
4. **API:** búsqueda de `startsWith(`, `path.join`/`path.resolve` sobre datos que llegan de fuera, `sendFile`, `res.download`, `createReadStream` y `express.static` en `4000-api-backend/src`. Por cada uno: de dónde viene la ruta y qué la acota.
5. **Redirecciones:** búsqueda de cada lectura de `?redirect=` y de su filtro.
6. **Pruebas en vivo (solo lectura):** `GET` sin cookies contra el `next dev` de la intranet (3001) y `new URL(...)` de Node, que implementa el mismo estándar WHATWG que los navegadores.

---

## Resultados

### 1. nginx: sin off-by-slash

| `location` | `proxy_pass` | ¿Barras coherentes? | Nota |
|---|---|---|---|
| `/api-backend/` (8080) | `http://api_backend/` | Sí | Quita el prefijo. Toda la API queda detrás, a propósito. |
| `^~ /api/revalidar` (8080) | `return 404` | — | Sin barra a propósito: **bloquea de más** (también `/api/revalidar/…`), que es lo seguro. |
| `/uploads/` | `…/api/archivos/sitio/uploads/` | Sí | |
| `/backup/` | `…/api/archivos/sitio/backup/` | Sí | |
| `/backend/` | `…/api/archivos/sitio/backup/` | Sí | |
| `/storage/` | `…/api/archivos/sitio/` | Sí | La API solo sirve lo que cuelga de `uploads/` o `backup/` (ver §3). |
| `= /api/upload` | `…/api/archivos/sitio` | — | Coincidencia exacta: no hay resto que concatenar. |
| `/api-backend/` (8081) | `http://api_backend/api/` | Sí | |
| `= /api/upload` (8081) | `…/api/archivos/intranet` | — | Exacta. |
| `/` | `http://sitio_web` / `http://intranet` | — | Sin URI: pasa la petición tal cual. |

- **No hay `alias` ni `root`** en el archivo: la variante clásica no puede darse.
- nginx normaliza la URI (`..`, `%2e%2e`, barras dobles) **antes** de elegir la `location`, y cuando `proxy_pass` lleva URI reenvía la forma normalizada. Un `/uploads/../x` llega a nginx como `/x` y lo atiende `location /`, no `/uploads/`.
- Aunque algo se colara hasta la API, la segunda barrera (§3) lo para.

> La prueba de nginx en un contenedor **no se ejecutó**. Docker Desktop estaba apagado; se arrancó, pero la prueba se dejó sin correr. El resultado de esta sección sale de leer la configuración, y en nginx eso basta: sin `alias`/`root` no hay ruta en disco que desbordar.

### 2. `next.config`: sin off-by-slash

Los `rewrites` de las dos apps (`/uploads/:path*`, `/backup/:path*`, `/backend/:path*`, `/storage/:path*`, `/api-backend/:path*` en la intranet, `/identidad-panel/:nombre` en el sitio) mantienen la barra a los dos lados y entregan el resto a la API, que lo acota (§3). `/identidad-panel/:nombre` acaba en una expresión regular con UUID (`filesystem.ts:83`).

### 3. API, servir archivos: correcto

| Función | Archivo | Qué la acota | ¿Bien? |
|---|---|---|---|
| `resolverArchivoServible` | [filesystem.ts:111-126](../4000-api-backend/src/infrastructure/storage/filesystem.ts#L111-L126) | Lista cerrada `uploads`/`backup`, `path.resolve` y `startsWith(base + path.sep)`, y después la lista blanca de extensiones | **Sí**: tiene la barra; `uploads-viejo/` y `../` quedan fuera |
| `borrarDeUploads` | [backup-uploads.service.ts:387-391](../4000-api-backend/src/infrastructure/storage/backup-uploads.service.ts#L387-L391) | El mismo `startsWith(dirUploads + path.sep)` | **Sí** |
| `resolverArchivoDeIdentidad` | [filesystem.ts:91-96](../4000-api-backend/src/infrastructure/storage/filesystem.ts#L91-L96) | Expresión regular de UUID + extensión: no admite `/` ni `..` | **Sí** |
| `resolverRutaDeCarga` | [filesystem.ts:66-69](../4000-api-backend/src/infrastructure/storage/filesystem.ts#L66-L69) | Se queda solo con el nombre (corta por `/` y `\`) | **Sí** |
| `resolverFormatoDeCarga` | `use-cases/observatorio/formatos-de-carga.ts` | Lista cerrada (`Map`) de nombres | **Sí** |
| `sendFile`/`download` | controladores de archivos, configuración, observatorio, alertas | Todos reciben una ruta ya resuelta por alguna de las de arriba; `dotfiles: 'deny'` | **Sí** |

No hay `express.static` en la API. CORS usa una lista exacta de orígenes (`app.ts:44`), no una comparación por prefijo.

### 4. H1 — respaldo y restauración sin contención (Media-alta)

**Dónde:** [backup-uploads.service.ts:160](../4000-api-backend/src/infrastructure/storage/backup-uploads.service.ts#L160) (`respaldarArchivosAlPublicar`), [:219](../4000-api-backend/src/infrastructure/storage/backup-uploads.service.ts#L219) y [:230](../4000-api-backend/src/infrastructure/storage/backup-uploads.service.ts#L230) (`restaurarArchivosDesdeBackup`).

```ts
const subRuta = rutaRelativa.replace(/^\/?uploads\//, '');
const rutaOrigenFisica = path.join(dirUploads, subRuta);   // ← sin comprobar que siga dentro
```

**De dónde sale la ruta:** `extraerRutasUploads` ([rutas-uploads-en-contenido.ts](../4000-api-backend/src/shared/rutas-uploads-en-contenido.ts)) recoge del JSON de la página cualquier texto que empiece por `/uploads/` y además lo **decodifica** (`decodeURIComponent`). Lo escribe quien edita la página. El saneo al guardar (`sanitizarUrl`, [sanitizar-contenido.ts:114-132](../4000-api-backend/src/shared/sanitizar-contenido.ts#L114-L132)) acepta toda ruta que empiece por `/`, así que un texto como `/uploads/../../<otra carpeta>/<archivo>` llega intacto a esa línea.

**Qué permite (deducido del código):**

- **Al aprobar** una versión nueva, cada ruta de la versión que estaba publicada se **copia o se mueve** a `sitio/backup/<paginaId>/`. Si la ruta sale de `uploads/`, el archivo de origen puede ser **cualquiera que pueda leer el proceso de la API**: un adjunto de la intranet (que exige sesión) o un Excel de `cargas-datos/` (que no se sirve nunca). Una vez en el backup del sitio se sirve **sin sesión** en `/backup/<paginaId>/<nombre>` si su extensión está en la lista blanca (pdf, xlsx, imágenes…). Cuando se mueve, **se borra el original**.
- **Al restaurar** una versión archivada, el **destino** (`rutaDestinoUploads`) no está acotado: un archivo del backup se puede escribir en otra carpeta del disco (el nombre sí queda fijado por el archivo del backup).
- El nombre dentro del backup (`nombreEnBackup`) corta por `/`, así que en Linux (el servidor) el destino del respaldo queda dentro de `backup/`. En Windows (desarrollo) un `\` en el nombre también lo desbordaría.

**Qué hace falta para explotarlo:** una cuenta con permiso de edición sobre una página y que una persona con permiso de publicación **apruebe dos veces** (la primera publica la ruta; la segunda dispara el respaldo). El texto puede ir escondido en cualquier campo, por ejemplo en el `href` de un enlace. Por eso la gravedad es media-alta y no crítica: cruza la frontera de sesión de la intranet y borra archivos, pero exige un rol interno y una aprobación.

**Arreglo propuesto:** la misma comprobación que ya tiene `borrarDeUploads`, en un solo sitio para que las tres llamadas la compartan (ver la memoria «reutilizar antes de duplicar»):

```ts
/** `ruta` resuelta dentro de `base`, o `null` si se sale (`..`, ruta absoluta). */
function dentroDe(base: string, ruta: string): string | null {
  const absoluta = path.resolve(base, ruta);
  return absoluta.startsWith(base + path.sep) ? absoluta : null;
}
```

Si devuelve `null`, se salta la ruta (como hace `borrarDeUploads`). Como segunda barrera, conviene que `extraerRutasUploads` descarte toda ruta con un segmento `..` o con `\`.

### 5. H2 — redirección abierta en el login (Media)

**Dónde:** [3001-intranet/…/login-view.tsx:67-71](../3001-intranet/src/features/login/components/login-view.tsx#L67-L71) y [3000-sitio-web/…/login-view.tsx:45-51](../3000-sitio-web/src/features/administracion/auth/components/login-view.tsx#L45-L51). Las dos acaban en `window.location.href = <redirect>` cuando el login sale bien (intranet `:147`, sitio `:117` y `:123`).

```ts
r.startsWith('/') && !r.startsWith('//')
```

**Prueba ejecutada** (Node, `new URL(r, 'http://localhost:3001')`):

| `redirect` | ¿Pasa el filtro? | El navegador va a |
|---|---|---|
| `/inicio` | sí | `http://localhost:3001/inicio` ✅ |
| `//evil.example` | no | (se descarta) ✅ |
| `/\evil.example` | **sí** | **`http://evil.example/`** ❌ |
| `/<tab>/evil.example` | **sí** | **`http://evil.example/`** ❌ |

En la URL del enlace serían `?redirect=/%5Cevil.example` y `?redirect=/%09/evil.example`. **Escenario:** llega un enlace al login real del SENA, la persona entra con su cuenta y acto seguido aterriza en una copia del login que le dice «contraseña incorrecta». Así es como se roban credenciales.

**Arreglo propuesto:** resolver contra el propio origen y comparar orígenes, en una sola función compartida por las dos apps:

```ts
function rutaInterna(r: string | null, porDefecto: string): string {
  if (!r) return porDefecto;
  const url = new URL(r, window.location.origin);
  return url.origin === window.location.origin ? url.pathname + url.search + url.hash : porDefecto;
}
```

### 6. H3 — el proxy de la intranet deja pasar `/api-backend…` (Baja)

**Dónde:** [3001-intranet/src/proxy.ts:71](../3001-intranet/src/proxy.ts#L71)

```ts
if (esRutaDeAcceso || pathname.startsWith('/api-backend')) {   // ← sin barra
```

La intención era dejar pasar el reenvío `/api-backend/...` a la API, que tiene su propia autenticación. Sin la barra, **cualquier** ruta que empiece por esas letras se salta la exigencia de sesión y la atiende el comodín `(secciones)/[...puckPath]`, con su marco (menú y pie de la intranet).

**Prueba ejecutada** (`curl` sin cookies contra el `next dev` del usuario):

| Ruta | Respuesta |
|---|---|
| `/inicio` | `307` → `/login?redirect=%2Finicio` ✅ |
| `/api-backendx` | **`200`**, pinta el marco de la intranet con «Página no encontrada» ❌ |

**Por qué es baja:** el slug sale de unir los segmentos con `-`, así que solo se alcanzan páginas cuyo slug empiece por `api-backend`, y no hay ninguna. Lo que se expone es el marco (menú y pie publicados), que ya era legible por O1. Si O1 se cierra, H3 pasa a ser la vía.

**Arreglo propuesto:** `pathname === '/api-backend' || pathname.startsWith('/api-backend/')`.

**Revisado y correcto en el mismo archivo y en el del sitio:** `RUTAS_DE_ACCESO` es una lista exacta (`includes`), no un prefijo. En el sitio, los `startsWith('/admin/…')` y `startsWith('/editor')` sin barra solo se ejecutan dentro de un `matcher` explícito y, si fallan, **piden más permisos de la cuenta**, no menos: bloquean de más, que es lo seguro.

### 7. O1 — contenido de la intranet sin sesión (fuera de alcance)

Apareció al seguir H3 y **no es un off-by-slash**, pero importa más que H3. [pagina.routes.ts:74-84](../4000-api-backend/src/routes/pagina.routes.ts#L74-L84): `GET /api/paginas/publica/:slug` y `GET /api/paginas/indice-busqueda` no llevan `requireAuth`, y el ámbito sale de la cabecera `X-Ambito`, que manda quien pide. `obtenerPaginaPublica` no mira la sesión. Así, una petición sin cookies a `/api-backend/api/paginas/publica/inicio` (por la puerta 8080 del sitio) con `X-Ambito: intranet` devolvería la portada de la intranet.

**No se probó en vivo** (sería leer contenido real de la base). Se deja para que el equipo lo confirme y decida: exigir sesión con `acceso.intranet` cuando el ámbito sea `intranet`, en la ruta o en el caso de uso.

---

## Recomendaciones (por orden)

1. **O1:** exigir sesión para `publica` e `indice-busqueda` cuando `X-Ambito` sea `intranet`.
2. **H1:** función `dentroDe(base, ruta)` usada en las tres resoluciones del servicio de backup, y descartar `..`/`\` en `extraerRutasUploads`. Revisar también los respaldos ya hechos: cualquier ruta guardada en `paginas_versiones.contenido` con `/uploads/` seguido de `..` (o de `%2e%2e`) es sospechosa.
3. **H2:** sustituir los dos filtros de `redirect` por la comparación de orígenes, en una pieza compartida.
4. **H3:** añadir la barra en `proxy.ts:71`.
5. **Regla para que no vuelva:** toda comparación de prefijo sobre rutas o URL lleva la frontera (`base + path.sep`, `'/x/'`, o la comparación de orígenes). Encaja en `3-seguridad-del-proyecto.md` §S1 y en el inspector de seguridad de `/auditar`.

---

## Limitaciones

- **H1 no se ejecutó en vivo.** Se empezó a preparar una prueba en una carpeta desechable, pero se detuvo antes de correrla y no se completó. Lo que dice §4 sale de leer el código, con las líneas citadas. Para confirmarlo, lo recomendable es una prueba unitaria **del arreglo**: que `dentroDe` rechace `../`, rutas absolutas y `\`.
- **nginx no se probó en contenedor** (§1). Docker Desktop se arrancó durante la sesión y quedó encendido.
- **O1 no se probó en vivo**, a propósito.
- Las pruebas en vivo fueron solo `GET` sin sesión contra el `next dev` local. No se tocó Neon, no se escribió en la base y no se usó ninguna cuenta.

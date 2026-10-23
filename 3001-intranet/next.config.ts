import type { NextConfig } from "next";
import path from "path";
import { directivaFrameSrc, directivaScriptSrc } from "@olo/url-policy";

const API_URL = process.env.API_BACKEND_URL || "http://127.0.0.1:4000";

/**
 * Content-Security-Policy para la intranet.
 *
 * Bloquea scripts inline y orígenes no confiables como segunda línea de defensa
 * contra XSS, incluso si algo escapa la sanitización del servidor.
 *
 * NOTA: Puck editor carga estilos inline y puede requerir 'unsafe-inline' en
 * style-src. Se usa 'report-only' en el encabezado hasta confirmar que ningún
 * bloque del editor es roto por la política. Cambiar a Content-Security-Policy
 * (sin -Report-Only) una vez validado en staging.
 *
 * @see 3-seguridad-del-proyecto.md §S2 (XSS del contenido — CRÍTICO)
 * @see openspec/changes/qa-seguridad-vistas-intranet/specs/qa-intranet-content-xss/spec.md
 */
const CSP_DIRECTIVAS = [
  // Scripts: solo del mismo origen; no inline, no eval
  "script-src 'self'",
  // Estilos: permite inline (requerido por Puck/Tailwind en dev) pero solo del mismo origen
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fuentes
  "font-src 'self' https://fonts.gstatic.com",
  // Imágenes: mismo origen + data: para previews del editor + miniaturas de YouTube
  "img-src 'self' data: blob: https://img.youtube.com",
  // Conexiones XHR/fetch: solo al backend local
  `connect-src 'self' ${API_URL}`,
  // Iframes: la lista única de `@olo/url-policy` (Power BI, dominios SENA y YouTube), la misma que
  // valida cada `iframe` al guardar y al pintar (bloques TasaDashboards, TasaVideo, RecursosVisuales)
  `frame-src ${directivaFrameSrc()}`,
  // Protección de clickjacking: solo mismo origen
  "frame-ancestors 'self'",
  // Formularios: solo al mismo origen
  "form-action 'self'",
  // Base-uri: solo mismo origen (previene base-tag injection)
  "base-uri 'self'",
  // PWA: el service worker (`public/sw.js`) y el manifiesto (`app/manifest.ts`) son
  // del mismo origen. Explícitos para que no dependan de a qué directiva recurre cada
  // navegador cuando faltan.
  "worker-src 'self'",
  "manifest-src 'self'",
].join('; ');

/**
 * Content-Security-Policy que **sí bloquea** (XSS-02, auditoría del 2026-10-22).
 *
 * Hasta ahora la intranet solo mandaba la política de arriba en `Report-Only`: registraba violaciones y no
 * bloqueaba nada, aunque los comentarios del código la contaban como la segunda capa contra XSS.
 *
 * Lo que se aplica es lo que no necesita nonce y no rompe nada:
 *  - `frame-src`: solo la propia página y los hosts de `@olo/url-policy` (la misma lista que
 *    valida cada `iframe` al guardar y al pintar). Un marco a un sitio ajeno queda bloqueado
 *    aunque se cuele.
 *  - `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'self'`.
 *  - `script-src`: solo la propia intranet, ningún otro origen. Con `'unsafe-inline'`
 *    **no** bloquea un script en línea ni un `javascript:`; eso lo cierran la validación por valor de
 *    `sanitizar-contenido.ts` y `enlaceSeguro`/`iframeSeguro` al pintar.
 *
 * Por qué no `script-src` estricto con nonce: la intranet sirve páginas estáticas y con ISR, que se
 * generan una vez y no pueden llevar un nonce distinto por petición; con nonce habría que volverlas
 * todas dinámicas. La intranet manda además la política estricta en `Report-Only` para medir
 * cuánto del código propio depende de scripts en línea antes de decidir (ver `CSP_DIRECTIVAS`).
 */
const CSP_APLICADA = [
  `script-src ${directivaScriptSrc()}${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  `frame-src ${directivaFrameSrc()}`,
  "worker-src 'self' blob:",
].join('; ');

const nextConfig: NextConfig = {
  output: "standalone",
  // DEBE coincidir con `turbopack.root` de abajo -- Next avisa en build si no
  // coinciden y usa `outputFileTracingRoot`, lo que rompe la resolución de los
  // paquetes @olo/* (verificado con un build real: sin esto Turbopack no encontraba
  // `/packages`, que vive fuera de este directorio). Como la raíz de rastreo queda
  // por encima de esta carpeta, el `standalone` output anida `server.js` bajo `app/`
  // -- ver el comentario del Dockerfile en la copia final, ya no es un valor a
  // adivinar.
  outputFileTracingRoot: path.resolve(process.cwd(), ".."),
  transpilePackages: [
    "@olo/accessibility-policy",
    "@olo/blocks-renderer",
    "@olo/email-policy",
    "@olo/inactividad",
    "@olo/password-policy",
    "@olo/slug-policy",
    "@olo/upload-policy",
    "@olo/url-policy",
  ],
  turbopack: {
    root: path.resolve(process.cwd(), "..")
  },
  async headers() {
    return [
      {
        // Aplica a todas las rutas de la intranet
        source: "/(.*)",
        headers: [
          {
            // La que bloquea (ver `CSP_APLICADA`).
            key: "Content-Security-Policy",
            value: CSP_APLICADA,
          },
          {
            // Report-Only: registra violaciones sin bloquear. Cambiar a
            // 'Content-Security-Policy' cuando se confirme compatibilidad en staging.
            key: "Content-Security-Policy-Report-Only",
            value: CSP_DIRECTIVAS,
          },
          {
            // Previene clickjacking — igual que frame-ancestors pero con soporte
            // para navegadores viejos (IE11).
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            // Previene MIME type sniffing
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Referrer mínimo para evitar filtración de URLs internas
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        // El service worker de la PWA (`public/sw.js`). Sin caché: una versión vieja
        // guardada en el navegador seguiría decidiendo qué se sirve sin conexión
        // después de un despliegue. La CSP es solo para lo que él mismo pida: nada
        // fuera de la propia intranet.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        // Desde el 2026-10-15 los pasos del acceso cuelgan de `/login`
        // (`app/(auth)/login/`), igual que en el sitio-web: el primer ingreso en
        // `/login/first-login` y la recuperación en `/login/recovery`. Entre el
        // 2026-09-18 y entonces fueron hermanos de `/login` en la raíz; estas reglas
        // cubren marcadores y pestañas abiertas con esas URLs. `/security-questions` y
        // `/reset-password` servían a los dos flujos; van a los de la recuperación, y
        // quien tenga el primer ingreso pendiente rebota desde ahí a su paso (`proxy.ts`).
        source: "/first-login",
        destination: "/login/first-login",
        permanent: false,
      },
      {
        source: "/security-questions",
        destination: "/login/recovery/security-questions",
        permanent: false,
      },
      {
        source: "/recovery",
        destination: "/login/recovery",
        permanent: false,
      },
      {
        source: "/reset-password",
        destination: "/login/recovery/reset-password",
        permanent: false,
      },
      {
        source: "/reset-success",
        destination: "/login/recovery/reset-success",
        permanent: false,
      },
      {
        // El editor se llamó `/editor/...` hasta el 2026-10-21 (`app/editor/`): cubre
        // marcadores y el `?redirect=` de un login que se quedara con la URL vieja.
        source: "/editor/:path*",
        destination: "/edit/:path*",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: `${API_URL}/api/:path*`,
      },
      /**
       * Los adjuntos de las páginas no viven en este proyecto: los guarda y los sirve la
       * API, desde su filesystem (`3-seguridad-del-proyecto.md` §S1), y para servir
       * los de la intranet exige sesión. Aquí solo se reenvían, con las URL públicas de
       * siempre (`/uploads/...`, `/backup/...`, lo que el contenido guarda en la BD) y la
       * cookie de sesión, que el reenvío pasa tal cual. La subida del editor sigue siendo
       * `POST /api/upload`.
       *
       * En el servidor nginx los manda directo a la API sin pasar por aquí
       * (`nginx.servidor.conf`); esto cubre `npm run dev` y cualquier acceso directo al
       * contenedor.
       */
      {
        source: "/uploads/:path*",
        destination: `${API_URL}/api/archivos/intranet/uploads/:path*`,
      },
      {
        source: "/backup/:path*",
        destination: `${API_URL}/api/archivos/intranet/backup/:path*`,
      },
      /**
       * Retrocompatibilidad: rutas históricas `/backend/...` que aún pida un navegador o
       * una vista previa. Son el backup.
       */
      {
        source: "/backend/:path*",
        destination: `${API_URL}/api/archivos/intranet/backup/:path*`,
      },
      /**
       * Y `/storage/uploads/...`, la ruta física de antes, que quedó escrita en algunos
       * valores por defecto de bloques (Publicaciones) y en el contenido guardado con
       * ellos. La API solo sirve lo que cuelgue de `uploads/` o `backup/`.
       */
      {
        source: "/storage/:path*",
        destination: `${API_URL}/api/archivos/intranet/:path*`,
      },
      {
        source: "/api/upload",
        destination: `${API_URL}/api/archivos/intranet`,
      },
    ];
  },
};

export default nextConfig;


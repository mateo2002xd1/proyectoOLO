import type { NextConfig } from "next";
import path from "path";

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
  // Iframes: Power BI, dominios SENA y YouTube (bloques TasaVideo/RecursosVisuales)
  "frame-src 'self' https://app.powerbi.com https://*.sena.edu.co https://www.youtube.com",
  // Protección de clickjacking: solo mismo origen
  "frame-ancestors 'self'",
  // Formularios: solo al mismo origen
  "form-action 'self'",
  // Base-uri: solo mismo origen (previene base-tag injection)
  "base-uri 'self'",
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
    ];
  },
  async redirects() {
    return [
      {
        // Los pasos del acceso dejaron de colgar de `/login` el 2026-09-18: viven en
        // `app/(auth)/`, al lado del login, igual que en el sitio-web. Esto cubre
        // marcadores y pestañas abiertas con la URL vieja. La lista es explícita a
        // propósito: un comodín mandaría cualquier `/login/<algo>` a la raíz, donde
        // podría caer en una sección.
        source: "/login/:paso(first-login|recovery|security-questions|reset-password|reset-success)",
        destination: "/:paso",
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
       * `uploads` y `backup` viven físicamente en `public/storage/` (unificados ahí
       * para no desparramar carpetas de almacenamiento en la raíz de `public`), pero
       * la URL pública sigue siendo la de siempre: `/uploads/...` y `/backup/...`.
       * Así el contenido ya publicado (que guarda esas rutas literales en la BD) no
       * necesita ninguna migración.
       */
      {
        source: "/uploads/:path*",
        destination: "/storage/uploads/:path*",
      },
      {
        source: "/backup/:path*",
        destination: "/storage/backup/:path*",
      },
      /**
       * Retrocompatibilidad transparente: si un navegador o vista previa solicita
       * una ruta histórica /backend/..., Next.js la sirve directamente desde el
       * backup real.
       */
      {
        source: "/backend/:path*",
        destination: "/storage/backup/:path*",
      },
    ];
  },
};

export default nextConfig;


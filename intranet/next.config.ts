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
  transpilePackages: ["@olo/blocks-renderer"],
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
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;


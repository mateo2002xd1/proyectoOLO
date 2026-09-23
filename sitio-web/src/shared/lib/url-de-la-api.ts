/**
 * Dirección de la API según dónde corre el código.
 *
 * En el navegador es la pública (`NEXT_PUBLIC_API_URL`, con el `/api-backend` que
 * reparte nginx). En el servidor es la interna (`BACKEND_URL`, el nombre del servicio en
 * la red de Docker). Los servicios usaban la pública en los dos lados, y dentro del
 * contenedor esa dirección no lleva a la API: las páginas del comodín `[slug]` daban 404
 * y, detrás de un túnel, cada lectura salía a internet y volvía a entrar.
 *
 * Se decide al cargar el módulo: Next evalúa por separado el bundle del servidor y el
 * del navegador. En desarrollo las dos valen `http://localhost:4000`.
 */
export const URL_DE_LA_API =
  typeof window === 'undefined'
    ? process.env.BACKEND_URL || 'http://localhost:4000'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

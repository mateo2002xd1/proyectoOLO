import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** La API vista desde este servidor: la misma que `shared/lib/url-de-la-api.ts`. */
const URL_DE_LA_API = process.env.BACKEND_URL || 'http://localhost:4000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // DEBE coincidir con `turbopack.root` de abajo -- Next avisa en build si no
  // coinciden y usa `outputFileTracingRoot`, lo que rompe la resolución de los
  // paquetes @olo/* (verificado con un build real: sin esto Turbopack no encontraba
  // `/packages`, que vive fuera de este directorio). Como la raíz de rastreo queda
  // por encima de esta carpeta, el `standalone` output anida `server.js` bajo `app/`
  // -- ver el comentario del Dockerfile en la copia final, ya no es un valor a
  // adivinar.
  outputFileTracingRoot: path.resolve(__dirname, '..'),
  transpilePackages: [
    '@olo/accessibility-policy',
    '@olo/blocks-renderer',
    '@olo/email-policy',
    '@olo/inactividad',
    '@olo/password-policy',
    '@olo/slug-policy',
    '@olo/upload-policy',
  ],
  turbopack: {
    root: path.resolve(__dirname, '..')
  },
  async headers() {
    return [
      {
        /**
         * El service worker de la PWA (`public/sw.js`). Sin caché: una versión vieja
         * guardada en el navegador seguiría decidiendo qué se sirve sin conexión
         * después de un despliegue. La CSP es solo para lo que él mismo pida: nada
         * fuera del propio sitio.
         */
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
  /**
   * Alias hacia las pantallas de acceso, que viven en `app/(auth)/`.
   *
   * `(auth)` es un grupo de rutas: agrupa las pantallas de acceso bajo una carpeta,
   * pero NO añade segmento a la URL. Por eso la ruta real es `/login` y no
   * `/auth/login`. Hasta el 2026-09-18 vivían en `app/(auth)/admin/`
   * (`/admin/login`, `/admin/recuperar`, `/admin/cambiar-contrasena`) y antes en
   * `/admin/auth/...`: todas siguen aquí como alias para los enlaces ya repartidos.
   *
   * Se evalúan en orden y gana la primera: `/admin/auth` a secas va antes que el
   * comodín, porque con él daría `/admin/`, que no existe.
   */
  async redirects() {
    return [
      /**
       * La portada vive en `/inicio`, no en `/`.
       *
       * Hasta ahora las dos rutas servían el mismo contenido (ambas leían el slug
       * `inicio`), o sea contenido duplicado bajo dos URLs. Se deja una sola, y la
       * elegida es `/inicio` porque coincide con el slug real que se edita y con la
       * ruta que usa la intranet para su portada.
       *
       * Redirige en vez de dar 404: la raíz de un sitio público es lo que la gente
       * escribe y lo que enlazan desde fuera. `permanent: false` mientras el sitio
       * no esté en producción — un 308 se queda cacheado en el navegador y volver
       * atrás obligaría a limpiar la caché de cada visitante.
       */
      {
        source: '/',
        destination: '/inicio',
        permanent: false,
      },
      {
        source: '/privacidad',
        destination: '/politica-de-privacidad',
        permanent: false,
      },
      {
        source: '/inicio/politica-de-privacidad',
        destination: '/politica-de-privacidad',
        permanent: false,
      },
      {
        // CNO y CUOC se movieron bajo `/clasificacion`, junto al buscador. Mismo motivo
        // que el de arriba: sin esto el comodín `[slug]` las seguiría sirviendo en la
        // raíz, y el menú publicado en la base todavía enlaza `/cno` y `/cuoc`.
        source: '/cno',
        destination: '/clasificacion/cno',
        permanent: false,
      },
      {
        source: '/cuoc',
        destination: '/clasificacion/cuoc',
        permanent: false,
      },
      {
        // Mismas carpetas y mismas rutas que la intranet desde el 2026-09-18.
        source: '/admin/login',
        destination: '/login',
        permanent: false,
      },
      {
        // Era una sola pantalla con los cuatro pasos; ahora cada paso es una ruta y
        // esta es la primera.
        source: '/admin/recuperar',
        destination: '/login/recovery',
        permanent: false,
      },
      {
        source: '/admin/cambiar-contrasena',
        destination: '/login/first-login',
        permanent: false,
      },
      {
        source: '/auth/login',
        destination: '/login',
        permanent: false,
      },
      {
        source: '/admin/auth',
        destination: '/login',
        permanent: false,
      },
      {
        // Cubre /admin/auth/login, /admin/auth/recuperar y
        // /admin/auth/cambiar-contrasena de una sola vez: van a /admin/<pantalla>, y
        // de ahí las reglas de arriba los llevan a la ruta actual.
        source: '/admin/auth/:path*',
        destination: '/admin/:path*',
        permanent: false,
      },
      {
        // El editor y la vista previa salieron de `/admin` el 2026-09-18: no son parte
        // del panel (no llevan su barra lateral) y así quedan en la misma ruta que en
        // la intranet. Esto cubre marcadores, enlaces copiados y el `?redirect=` de un
        // login que se quedara a medias con la URL vieja.
        source: '/admin/editor/:path*',
        destination: '/editor/:path*',
        permanent: false,
      },
      {
        source: '/admin/preview/:path*',
        destination: '/preview/:path*',
        permanent: false,
      },
      {
        // Desde el 2026-10-15 los pasos del acceso cuelgan de `/login`, igual que en la
        // intranet: el primer ingreso en `/login/first-login` y la recuperación en
        // `/login/recovery`. Antes eran hermanos de `/login` en la raíz.
        source: '/first-login',
        destination: '/login/first-login',
        permanent: false,
      },
      {
        source: '/security-questions',
        destination: '/login/first-login/security-questions',
        permanent: false,
      },
      {
        source: '/recovery',
        destination: '/login/recovery',
        permanent: false,
      },
      {
        source: '/reset-password',
        destination: '/login/recovery/reset-password',
        permanent: false,
      },
      {
        source: '/reset-success',
        destination: '/login/recovery/reset-success',
        permanent: false,
      },
      {
        // Configuración, el buscador y el perfil dejaron `/admin/dashboard/` y
        // `/admin/mi-perfil` el 2026-10-15: cuelgan directamente de `/admin`.
        source: '/admin/dashboard/configuracion',
        destination: '/admin/configuracion',
        permanent: false,
      },
      {
        source: '/admin/dashboard/buscar',
        destination: '/admin/buscar',
        permanent: false,
      },
      {
        source: '/admin/mi-perfil',
        destination: '/admin/perfil',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      /**
       * Los adjuntos de las páginas no viven en este proyecto: los guarda y los sirve la
       * API, desde su filesystem (`3-seguridad-del-proyecto.md` §S1). Aquí solo se
       * reenvían, con las URL públicas de siempre: `/uploads/...` y `/backup/...`, que
       * es lo que el contenido publicado guarda literal en la BD. La subida del editor
       * sigue siendo `POST /api/upload`.
       *
       * En el servidor nginx los manda directo a la API sin pasar por aquí
       * (`nginx.servidor.conf`); esto cubre `npm run dev` y cualquier acceso directo al
       * contenedor. Next fija los rewrites al compilar, así que la dirección es la de
       * `BACKEND_URL` en ese momento (el Dockerfile la recibe como argumento).
       */
      {
        source: '/uploads/:path*',
        destination: `${URL_DE_LA_API}/api/archivos/sitio/uploads/:path*`,
      },
      {
        source: '/backup/:path*',
        destination: `${URL_DE_LA_API}/api/archivos/sitio/backup/:path*`,
      },
      /**
       * Retrocompatibilidad: rutas históricas `/backend/...` que aún pida un navegador o
       * una vista previa. Son el backup.
       */
      {
        source: '/backend/:path*',
        destination: `${URL_DE_LA_API}/api/archivos/sitio/backup/:path*`,
      },
      /**
       * Y `/storage/uploads/...`, la ruta física de antes, que quedó escrita en algunos
       * valores por defecto de bloques (Publicaciones) y en el contenido guardado con
       * ellos. La API solo sirve lo que cuelgue de `uploads/` o `backup/`.
       */
      {
        source: '/storage/:path*',
        destination: `${URL_DE_LA_API}/api/archivos/sitio/:path*`,
      },
      {
        source: '/api/upload',
        destination: `${URL_DE_LA_API}/api/archivos/sitio`,
      },
      /**
       * El logo y el icono del panel que se suben en Configuración → Identidad visual.
       * Los guarda la API aparte de `uploads/` (`filesystem/panel/identidad/`). En el
       * servidor también pasan por aquí: nginx manda a Next todo lo que no conoce.
       */
      {
        source: '/identidad-panel/:nombre',
        destination: `${URL_DE_LA_API}/api/configuracion/identidad-panel/archivos/:nombre`,
      },
    ];
  },
};

export default nextConfig;

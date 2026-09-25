import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
        /**
         * `/privacidad` era un alias que servía el mismo componente que
         * `/politica-de-privacidad` bajo otra URL — contenido duplicado bajo dos
         * rutas. Ahora que `politica-de-privacidad` es una sección Puck editable
         * de verdad (con su propia fila en `paginas`), el alias no tiene contenido
         * propio que editar: redirige a la canónica en vez de mostrar una copia
         * que nunca se actualizaría con lo que se publique.
         */
        source: '/privacidad',
        destination: '/inicio/politica-de-privacidad',
        permanent: false,
      },
      {
        /**
         * La política se movió bajo `/inicio`. Sin este redirect la URL vieja no daría
         * 404: la atraparía el comodín `[slug]`, que busca por slug y el slug no
         * cambió, así que serviría la misma página por segunda vez y sin su metadata.
         * También es la red para los enlaces que no se pueden corregir en el código:
         * los que ya están guardados en el pie publicado de la base de datos.
         */
        source: '/politica-de-privacidad',
        destination: '/inicio/politica-de-privacidad',
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
        destination: '/recovery',
        permanent: false,
      },
      {
        source: '/admin/cambiar-contrasena',
        destination: '/first-login',
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
    ];
  },
  async rewrites() {
    return [
      /**
       * `uploads` y `backup` viven físicamente en `public/storage/` (unificados ahí
       * para no desparramar carpetas de almacenamiento en la raíz de `public`), pero
       * la URL pública sigue siendo la de siempre: `/uploads/...` y `/backup/...`.
       * Así el contenido ya publicado (que guarda esas rutas literales en la BD) no
       * necesita ninguna migración.
       */
      {
        source: '/uploads/:path*',
        destination: '/storage/uploads/:path*',
      },
      {
        source: '/backup/:path*',
        destination: '/storage/backup/:path*',
      },
      /**
       * Retrocompatibilidad transparente: si un navegador o vista previa solicita
       * una ruta histórica /backend/..., Next.js la sirve directamente desde el
       * backup real.
       */
      {
        source: '/backend/:path*',
        destination: '/storage/backup/:path*',
      },
    ];
  },
};

export default nextConfig;

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
  /**
   * Alias hacia las pantallas de acceso, que viven en `app/admin/(auth)/`.
   *
   * `(auth)` es un grupo de rutas: agrupa las tres pantallas sin sesión bajo una
   * carpeta, pero NO añade segmento a la URL. Por eso la ruta real es
   * `/admin/login` y no `/admin/auth/login` — que fue la canónica hasta el rename
   * y sigue aquí como alias para los enlaces ya repartidos.
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
        source: '/login',
        destination: '/admin/login',
        permanent: false,
      },
      {
        source: '/auth/login',
        destination: '/admin/login',
        permanent: false,
      },
      {
        source: '/admin/auth',
        destination: '/admin/login',
        permanent: false,
      },
      {
        // Cubre /admin/auth/login, /admin/auth/recuperar y
        // /admin/auth/cambiar-contrasena de una sola vez.
        source: '/admin/auth/:path*',
        destination: '/admin/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

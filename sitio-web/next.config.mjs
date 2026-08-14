import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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

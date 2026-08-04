import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  turbopack: {
    root: path.resolve(__dirname, '..')
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/admin/auth/login',
        permanent: false,
      },
      {
        source: '/admin/login',
        destination: '/admin/auth/login',
        permanent: false,
      },
      {
        source: '/auth/login',
        destination: '/admin/auth/login',
        permanent: false,
      },
      {
        source: '/admin/auth',
        destination: '/admin/auth/login',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

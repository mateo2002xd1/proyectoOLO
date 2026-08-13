import type { IdentidadVisual } from '../types';

export const defaultIdentidadVisual: IdentidadVisual = {
  govBannerEnabled: true,
  intranetText: 'Intranet',
  // Base origin de la intranet. Se enlaza a la raíz a propósito: es la propia
  // intranet (app/page.tsx) la que decide, server-side, si redirige a `/inicio`
  // (sesión activa) o a `/login`, porque la cookie `token` es httpOnly y este
  // sitio no puede leerla para decidirlo antes.
  intranetUrl: 'http://localhost:3001',
  navLinks: [
    { label: 'Inicio', href: '/', active: true },
    { label: 'Clasificaciones', href: '/clasificacion' },
    { label: 'Tendencias', href: '/tendencias' },
    { label: 'Publicaciones', href: '/publicaciones' },
    { label: 'APE', href: '/ape' },
  ],
};

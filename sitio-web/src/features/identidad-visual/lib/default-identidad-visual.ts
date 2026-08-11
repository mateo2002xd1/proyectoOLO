import type { IdentidadVisual } from '../types';

export const defaultIdentidadVisual: IdentidadVisual = {
  govBannerEnabled: true,
  intranetText: 'Intranet',
  intranetUrl: 'http://localhost:3001/login',
  navLinks: [
    { label: 'Inicio', href: '/', active: true },
    { label: 'Clasificaciones', href: '/clasificacion' },
    { label: 'Tendencias', href: '/tendencias' },
    { label: 'Publicaciones', href: '/publicaciones' },
    { label: 'APE', href: '/ape' },
  ],
};

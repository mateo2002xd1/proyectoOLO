'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { poppins } from '@/shared/lib/typography/fonts';

/**
 * Page order map — used to determine slide direction.
 * Higher number = deeper in the auth flow.
 *
 * Desde el 2026-10-15 los pasos cuelgan de `/login` (`app/(auth)/login/`); `(auth)`
 * es un grupo de rutas y no añade segmento a la URL. Las rutas viejas, hermanas de
 * `/login` (`/recovery`...), redirigen aquí desde `next.config.ts`.
 */
const PAGE_ORDER: Record<string, number> = {
  '/login': 0,
  '/login/recovery': 1,
  '/login/first-login': 1,
  '/login/first-login/security-questions': 2,
  '/login/first-login/change-password': 2,
  '/login/first-login/change-success': 3,
  '/login/recovery/security-questions': 2,
  '/login/recovery/reset-password': 3,
  '/login/recovery/reset-success': 4,
};

export default function LoginTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // La dirección se deriva de la ruta anterior. Antes se guardaba en un ref
  // leído durante el render y en sessionStorage; ambas cosas son incorrectas:
  // los refs no deben leerse en render, y leer sessionStorage ahí hace que el
  // servidor y el cliente rendericen clases distintas (error de hidratación).
  // Este es el patrón de React para ajustar estado cuando cambia una prop.
  const [rutaAnterior, setRutaAnterior] = useState(pathname);
  const [direccion, setDireccion] = useState<'forward' | 'backward'>('forward');

  if (pathname !== rutaAnterior) {
    const ordenAnterior = PAGE_ORDER[rutaAnterior] ?? 0;
    const ordenActual = PAGE_ORDER[pathname] ?? 0;
    setRutaAnterior(pathname);
    setDireccion(ordenActual >= ordenAnterior ? 'forward' : 'backward');
  }

  return (
    <div className={`${poppins.className} auth-page-transition auth-slide-${direccion}`}>
      {children}
    </div>
  );
}

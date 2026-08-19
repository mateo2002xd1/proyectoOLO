import { ReactNode } from 'react';
import { poppins } from '@/shared/lib/fonts';

/**
 * Tipografía de las pantallas de acceso (login, recuperar, cambiar contraseña).
 * Se aplica aquí y no en `admin/layout.tsx` porque este grupo no comparte nada
 * más con `(shell)` — cada uno monta su propia envoltura.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className={poppins.className}>{children}</div>;
}

import { ReactNode } from 'react';
import { poppins } from '@/shared/lib/fonts';

/**
 * Tipografía de las pantallas de acceso (login, recuperar, cambiar contraseña).
 *
 * Estas pantallas viven en `app/(auth)/admin/` y no en `app/admin/` a propósito:
 * `admin/layout.tsx` pinta el panel (barra lateral, sesión, vigilante de
 * inactividad), y en Next un layout envuelve todo lo que cuelga de su carpeta sin
 * que una página pueda saltárselo. Poniéndolas en otra rama del árbol la URL sigue
 * siendo `/admin/login`, pero el marco del panel no las alcanza.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className={poppins.className}>{children}</div>;
}

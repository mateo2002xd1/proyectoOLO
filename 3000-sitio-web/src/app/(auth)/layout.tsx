import { ReactNode } from 'react';
import { FlujoDeRecuperacionProvider, LetraDelPanel } from '@/features/admin-panel/auth';

/**
 * Lo común a las pantallas de acceso: login, primer ingreso y los cuatro pasos de la
 * recuperación de contraseña.
 *
 * Mismas carpetas que la intranet: `app/(auth)/login/`, y dentro `first-login/` (con
 * `security-questions/` y `change-password/`, los casos de la misma pantalla) y
 * `recovery/` (con `security-questions/`, `reset-password/` y `reset-success/`). Desde
 * el 2026-10-15 cada paso cuelga del flujo al que pertenece.
 * `(auth)` es un grupo de rutas: agrupa sin añadir segmento a la URL, así que el login
 * es `/login` y la recuperación `/login/recovery`. Hasta el 2026-09-18 vivían en
 * `app/(auth)/admin/` (`/admin/login`, `/admin/recuperar`, `/admin/cambiar-contrasena`),
 * y hasta el 2026-10-15 los pasos eran hermanos de `/login` (`/recovery`,
 * `/first-login`...); todas esas URLs redirigen aquí desde `next.config.mjs`.
 *
 * Aquí se monta `FlujoDeRecuperacionProvider`, que guarda en memoria lo que un paso deja
 * al siguiente (ver `flujo-de-recuperacion.tsx`) y no debe reiniciarse al pasar de uno a
 * otro. Next conserva un layout mientras se navega entre las páginas que envuelve; por eso
 * el estado vive aquí y no en cada página.
 *
 * El marco no: lo pinta cada pantalla con `MarcoDePasos`, porque su mitad izquierda dice
 * en qué paso se está. Hasta el 2026-10-09 el login usaba otro, `AuthSplitShell`, montado
 * aquí; con el login en el diseño nuevo se quitó.
 *
 * Fuera de `app/admin/` a propósito: `admin/layout.tsx` pinta el panel (barra
 * lateral, sesión, vigilante de inactividad), y estas pantallas no llevan panel.
 * Sí comparten su letra, Poppins: la pone `LetraDelPanel`.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <LetraDelPanel />
      <FlujoDeRecuperacionProvider>{children}</FlujoDeRecuperacionProvider>
    </>
  );
}

import { ReactNode } from 'react';
import { AuthSplitShell, FlujoDeRecuperacionProvider } from '@/features/administracion/auth';
import { poppins } from '@/shared/lib/fonts';

/**
 * Marco común de las pantallas de acceso: login, primer ingreso y los cuatro pasos
 * de la recuperación de contraseña.
 *
 * Mismas carpetas que la intranet (`app/(auth)/login`, `first-login`, `recovery`,
 * `security-questions`, `reset-password`, `reset-success`). `(auth)` es un grupo de
 * rutas: agrupa sin añadir segmento a la URL, así que el login es `/login` y la
 * recuperación `/recovery`, no `/login/recovery`. Hasta el 2026-09-18 vivían en
 * `app/(auth)/admin/` (`/admin/login`, `/admin/recuperar`, `/admin/cambiar-contrasena`);
 * esas URLs redirigen aquí desde `next.config.mjs`.
 *
 * Aquí se montan dos cosas que no deben reiniciarse al pasar de un paso a otro:
 *   - el marco (`AuthSplitShell`), para que no parpadee;
 *   - `FlujoDeRecuperacionProvider`, que guarda en memoria lo que un paso deja al siguiente
 *     (ver `flujo-de-recuperacion.tsx`). Next conserva un layout mientras se navega entre
 *     las páginas que envuelve; por eso el estado vive aquí y no en cada página.
 *
 * Fuera de `app/admin/` a propósito: `admin/layout.tsx` pinta el panel (barra
 * lateral, sesión, vigilante de inactividad), y estas pantallas no llevan panel.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={poppins.className}>
      <FlujoDeRecuperacionProvider>
        <AuthSplitShell>{children}</AuthSplitShell>
      </FlujoDeRecuperacionProvider>
    </div>
  );
}

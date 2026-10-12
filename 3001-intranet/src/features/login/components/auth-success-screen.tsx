'use client';

import { useAuth } from '@/features/login';
import { MarcoAcceso } from './marco-acceso';
import { accesoBotonClass, accesoHuecoClass, accesoTextoSecundarioClass } from './acceso-ui';

interface AuthSuccessScreenProps {
  title: string;
  subtitle: string;
  hint?: string;
  loginLabel?: string;
}

export function AuthSuccessScreen({
  title,
  subtitle,
  hint,
  loginLabel = 'Ir a iniciar sesión',
}: AuthSuccessScreenProps) {
  const { logout } = useAuth();

  return (
    <MarcoAcceso
      titulo={title}
      descripcion={subtitle}
      cerrarSesionAlSalir
      // Sin la insignia blanca con el check encima: la quitó el usuario el 2026-10-11. El
      // «listo» lo dice el título.
      claseTarjeta="text-center"
    >
      {hint && <p className={`${accesoHuecoClass} ${accesoTextoSecundarioClass}`}>{hint}</p>}

      <button type="button" onClick={() => logout()} className={accesoBotonClass}>
        {loginLabel}
      </button>
    </MarcoAcceso>
  );
}

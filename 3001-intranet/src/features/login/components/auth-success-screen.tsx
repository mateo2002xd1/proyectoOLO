'use client';

import { useAuth } from '@/features/login';
import { MarcoAcceso } from './marco-acceso';
import { accesoBotonClass } from './acceso-ui';

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
      claseTarjeta="text-center"
      antesDelTitulo={
        // Insignia con el check institucional. Va también desde `xl`, cuando el título
        // ya se fue a la izquierda: es lo que dice «listo» dentro de la tarjeta.
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-[#0d1526]">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      }
    >
      {hint && <p className="mb-6 text-sm text-gray-500">{hint}</p>}

      <button type="button" onClick={() => logout()} className={accesoBotonClass}>
        {loginLabel}
      </button>
    </MarcoAcceso>
  );
}

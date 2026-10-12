'use client';

import { useAuth } from '@/features/login';
import { MarcoAcceso } from './marco-acceso';
import { accesoBotonClass, accesoBotonEnBlancoClass, accesoHuecoClass, accesoTextoSecundarioClass } from './acceso-ui';

interface AuthSuccessScreenProps {
  title: string;
  /** Uno o varios párrafos. */
  subtitle: string | string[];
  hint?: string;
  loginLabel?: string;
  /** Tarjeta blanca desde `md`, como `MarcoAcceso`. */
  enBlanco?: boolean;
  /** Desde `md`, el `subtitle` dentro de la tarjeta (`descripcionEnTarjeta` del marco). */
  descripcionEnTarjeta?: boolean;
  /** La insignia con el check encima del botón. */
  conInsignia?: boolean;
}

export function AuthSuccessScreen({
  title,
  subtitle,
  hint,
  loginLabel = 'Ir a iniciar sesión',
  enBlanco = false,
  descripcionEnTarjeta = false,
  conInsignia = true,
}: AuthSuccessScreenProps) {
  const { logout } = useAuth();

  return (
    <MarcoAcceso
      titulo={title}
      descripcion={subtitle}
      cerrarSesionAlSalir
      claseTarjeta="text-center"
      enBlanco={enBlanco}
      descripcionEnTarjeta={descripcionEnTarjeta}
    >
      {/* Insignia con el check: es lo que dice «listo» junto al botón. Blanca, como el
          botón, sobre el azul. Se quitó por error el 2026-10-11 junto con la del primer
          ingreso y se repuso el mismo día: el pedido era solo para el primer ingreso. El
          2026-10-12 el usuario la quitó del aviso de «clave actualizada» (`conInsignia`). */}
      {conInsignia && (
        <div className="mx-auto mb-[clamp(0.75rem,2.2dvh,1.5rem)] flex size-12 items-center justify-center rounded-full bg-white">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#0d1526]"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
      {hint && <p className={`${accesoHuecoClass} ${accesoTextoSecundarioClass}`}>{hint}</p>}

      <button type="button" onClick={() => logout()} className={enBlanco ? `${accesoBotonClass} ${accesoBotonEnBlancoClass}` : accesoBotonClass}>
        {loginLabel}
      </button>
    </MarcoAcceso>
  );
}

'use client';

import { poppins } from '@/shared/lib/fonts';
import { MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';
import { useCierreAnimado } from '@/shared/lib/use-cierre-animado';

export interface ModalCerrarSesionProps {
  abierto: boolean;
  /** Mientras se cierra la sesión el modal no se puede descartar. */
  saliendo: boolean;
  alConfirmar: () => void;
  alCerrar: () => void;
}

/**
 * Confirmación antes de «Salir del modo edición edición»: el botón está siempre a la vista
 * junto al lápiz y un toque sin querer cerraba la sesión de golpe.
 */
export function ModalCerrarSesion({ abierto, saliendo, alConfirmar, alCerrar }: ModalCerrarSesionProps) {
  const { montado, cerrando } = useCierreAnimado(abierto);

  if (!montado) return null;

  const cerrar = () => {
    if (!saliendo) alCerrar();
  };

  return (
    <div
      className="nueva-seccion-fondo olo-anim-fondo"
      data-cerrando={cerrando || undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cerrar-sesion-titulo"
      // Cerrar al pulsar fuera, pero solo si el clic empieza en el fondo.
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) cerrar();
      }}
      onKeyDown={(evento) => {
        if (evento.key === 'Escape') cerrar();
      }}
    >
      {/* Poppins, como todos los modales del panel y del editor. */}
      <div className={`nueva-seccion-caja olo-anim-caja ${poppins.className}`}>
        <h2 id="cerrar-sesion-titulo" className="nueva-seccion-titulo">
          Salir del modo edición
        </h2>

        {/* Lo que va a pasar, en un mensaje informativo (pedido del usuario, 2026-10-15);
            debajo, en texto normal, lo que implica. Mismo texto en el sitio y la intranet. */}
        <MensajeEstado tipo="info" rol="note">
          Saldrás del modo edición, volverás a la pantalla de inicio de sesión.
        </MensajeEstado>
        <p className="mt-3 text-base leading-6 text-[#4b5563]">Requiere volver a iniciar sesión para editar.</p>

        <div className="nueva-seccion-acciones">
          {/* El foco arranca en «Cancelar»: Enter o Escape no cierran la sesión. */}
          <button
            type="button"
            onClick={cerrar}
            className="nueva-seccion-boton"
            disabled={saliendo}
            autoFocus
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={alConfirmar}
            className="nueva-seccion-boton nueva-seccion-boton--peligro"
            disabled={saliendo}
          >
            {saliendo ? 'Cerrando sesión...' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
}

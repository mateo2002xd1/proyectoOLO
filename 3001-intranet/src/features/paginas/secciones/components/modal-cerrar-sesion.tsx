'use client';

import { useCierreAnimado } from '@/shared/lib/use-cierre-animado';
import { poppins } from '@/shared/lib/fonts';
import { MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';

export interface ModalCerrarSesionProps {
  abierto: boolean;
  /** Mientras se cierra la sesión el modal no se puede descartar. */
  saliendo: boolean;
  alConfirmar: () => void;
  alCerrar: () => void;
}

/**
 * Confirmación antes de cerrar sesión desde el botón flotante: está siempre a la
 * vista junto al lápiz y un toque sin querer cerraba la sesión de golpe.
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
      <div className={`nueva-seccion-caja olo-anim-caja ${poppins.className}`}>
        <h2 id="cerrar-sesion-titulo" className="nueva-seccion-titulo">
          Salir del modo edición
        </h2>

        {/* Las dos frases dentro del mensaje informativo, una por línea (pedido del usuario,
            2026-10-15). Mismo texto en el sitio y la intranet. */}
        <MensajeEstado tipo="info" rol="note">
          <p>Saldrás del modo edición, volverás a la pantalla de inicio de sesión.</p>
          <p className="mt-3">Requiere volver a iniciar sesión para editar.</p>
        </MensajeEstado>

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

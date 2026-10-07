'use client';

export interface ModalCerrarSesionProps {
  abierto: boolean;
  /** Mientras se cierra la sesión el modal no se puede descartar. */
  saliendo: boolean;
  alConfirmar: () => void;
  alCerrar: () => void;
}

/**
 * Confirmación antes de «Salir de modo edición»: el botón está siempre a la vista
 * junto al lápiz y un toque sin querer cerraba la sesión de golpe.
 */
export function ModalCerrarSesion({ abierto, saliendo, alConfirmar, alCerrar }: ModalCerrarSesionProps) {
  if (!abierto) return null;

  const cerrar = () => {
    if (!saliendo) alCerrar();
  };

  return (
    <div
      className="nueva-seccion-fondo"
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
      <div className="nueva-seccion-caja">
        <h2 id="cerrar-sesion-titulo" className="nueva-seccion-titulo">
          ¿Cerrar sesión?
        </h2>

        <p className="nueva-seccion-ruta">
          Saldrás del modo edición y volverás a la pantalla de inicio de sesión.
        </p>

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
            {saliendo ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}

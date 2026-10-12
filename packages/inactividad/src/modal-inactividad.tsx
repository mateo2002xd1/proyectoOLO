'use client';

import { useEffect, useRef } from 'react';
import { formatearCuentaAtras, segundosRestantes } from './index';

interface ModalInactividadProps {
  /** Milisegundos que faltan para el cierre, o `null` si no hay aviso en curso. */
  msRestantes: number | null;
  onSeguir: () => void;
}

/**
 * Aviso de que la sesión está a punto de cerrarse.
 *
 * Es un `<dialog>` nativo por las mismas razones que `ModalSalir` en
 * `puck-editor-wrapper.tsx`, de donde se copia el patrón: se pinta en la capa superior
 * del navegador —así no hay que pelear con el apilamiento del editor de Puck, que es
 * donde más falta hace— y trae el foco atrapado y el cierre con Escape sin escribir
 * nada.
 *
 * Vive en el paquete y no en cada app porque las dos lo pintan igual: `.olo-modal*` y
 * `.sr-only` están definidas en los dos `globals.css`. Lo que cambia entre ellas es a
 * quién se llama para cerrar y a dónde se va después, y eso se queda en cada
 * `vigilante-sesion.tsx`.
 *
 * El foco arranca en «Seguir trabajando», el único botón: ante un modal que aparece
 * solo, la tecla Intro por reflejo no debe cerrar la sesión de nadie.
 */
export function ModalInactividad({ msRestantes, onSeguir }: ModalInactividadProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const abierto = msRestantes !== null;

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  if (!abierto) return null;

  const segundos = segundosRestantes(msRestantes);

  /**
   * Qué se le anuncia a un lector de pantalla.
   *
   * El número visible cambia cada segundo, pero anunciarlo con esa cadencia deja el
   * lector hablando encima de sí mismo y tapa el resto del diálogo. Se avisa solo en
   * los múltiplos de diez y en los últimos cinco segundos, que es cuando de verdad
   * importa reaccionar.
   */
  const anuncio =
    segundos % 10 === 0 || segundos <= 5 ? `Quedan ${segundos} segundos` : '';

  return (
    <dialog
      ref={ref}
      className="olo-modal olo-anim-dialogo"
      aria-labelledby="olo-inactividad-titulo"
      aria-describedby="olo-inactividad-texto"
      // Escape equivale a «seguir trabajando»: es la opción que no interrumpe a nadie.
      // Se corta el cierre por defecto para que el estado de React no se quede creyendo
      // que el diálogo sigue abierto.
      onCancel={(evento) => {
        evento.preventDefault();
        onSeguir();
      }}
      // Pulsar fuera también es seguir. Cualquier interacción con la pantalla es, de
      // hecho, la señal de actividad que este modal estaba esperando.
      onClick={(evento) => {
        if (evento.target === ref.current) onSeguir();
      }}
    >
      <div className="olo-modal-caja">
        <h2 id="olo-inactividad-titulo" className="olo-modal-titulo">
          ¿Sigues ahí?
        </h2>
        <p id="olo-inactividad-texto" className="olo-modal-texto">
          Tu sesión se cerrará en{' '}
          <strong className="olo-modal-cuenta">{formatearCuentaAtras(msRestantes)}</strong>{' '}
          por inactividad.
        </p>
        <p className="olo-modal-texto olo-modal-texto--apunte">
          Cerramos las sesiones inactivas para que nadie más pueda usar tu cuenta si dejas el
          equipo desatendido.
        </p>

        {/* La cuenta atrás para lectores de pantalla, separada de la visible. */}
        <span className="sr-only" aria-live="polite" role="status">
          {anuncio}
        </span>

        <div className="olo-modal-acciones">
          <button
            type="button"
            className="olo-modal-btn olo-modal-btn--principal"
            onClick={onSeguir}
            autoFocus
          >
            Seguir trabajando
          </button>
        </div>
      </div>
    </dialog>
  );
}

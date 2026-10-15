'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCierreAnimado } from '@/shared/lib/use-cierre-animado';
import { BellAlertIcon } from '@heroicons/react/24/outline';
import { IconoError } from '@/shared/ui/molecules/mensaje-estado';

export interface Rechazo {
  /** Puede faltar en versiones rechazadas antes de que el motivo fuera obligatorio. */
  motivo: string | null;
  numeroVersion: number | null;
}

/**
 * Campana de aviso del editor: por qué esta versión volvió a borrador.
 *
 * Solo se dibuja cuando hay un rechazo que contar. Una campana permanente que al
 * pulsarla dice «no hay nada» es un control muerto, y aquí el rechazo es la única
 * notificación que el editor puede recibir: el motivo también queda en la bitácora
 * de auditoría, pero esa pantalla es de administradores y un editor no la ve.
 *
 * El botón usa estilos en línea, como el resto de la cabecera del editor, porque
 * este árbol lo monta Puck y no hereda las clases del panel. El mensaje, en
 * cambio, sale por `createPortal` a `document.body`: antes era un popover anclado
 * al botón, y el toolbar de Puck lo recortaba o lo tapaba — de ahí que "no se
 * viera" al pulsar. Como modal centrado, ya no depende de dónde quede el botón
 * dentro de ese toolbar.
 *
 * Gemelo del de `sitio-web` (`features/paginas/components/aviso-rechazo.tsx`).
 */
export function AvisoRechazo({ motivo, numeroVersion }: Rechazo) {
  const [abierto, setAbierto] = useState(false);
  const { montado, cerrando } = useCierreAnimado(abierto);

  // Solo Escape: el modal ya tiene su propio fondo clicable para cerrar.
  useEffect(() => {
    if (!abierto) return;
    const alPulsarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('keydown', alPulsarTecla);
    return () => document.removeEventListener('keydown', alPulsarTecla);
  }, [abierto]);

  const titulo =
    numeroVersion === null ? 'Versión rechazada' : `Versión ${numeroVersion} rechazada`;

  return (
    <div style={{ position: 'relative', display: 'flex' }}>
      <button
        type="button"
        onClick={() => setAbierto((previo) => !previo)}
        aria-expanded={abierto}
        aria-haspopup="dialog"
        aria-label={`${titulo}. Ver el motivo`}
        title={titulo}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          background: abierto ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          border: 'none',
          borderRadius: 6,
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        <BellAlertIcon style={{ width: 22, height: 22 }} />
        {/* Punto rojo: el aviso se ve sin tener que abrirlo. */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            width: 8,
            height: 8,
            background: '#d90000',
            borderRadius: '50%',
          }}
        />
      </button>

      {montado &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="presentation"
            className="olo-anim-fondo"
            data-cerrando={cerrando || undefined}
            // Cerrar al pulsar fuera, pero solo si el clic empieza en el fondo:
            // arrastrar desde dentro del diálogo hasta soltarlo fuera no debe cerrarlo.
            onMouseDown={(evento) => {
              if (evento.target === evento.currentTarget) setAbierto(false);
            }}
            style={{
              position: 'fixed',
              inset: 0,
              // Muy por encima de cualquier overlay de Puck (su `[data-resize-overlay]`
              // usa 9999): sin margen de sobra, un modal centrado puede terminar
              // pintado detrás de la propia UI del editor y parecer que "no hace nada".
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              background: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(2px)',
            }}
          >
            <div
              role="dialog"
              className="olo-anim-caja"
              aria-modal="true"
              aria-label="Motivo del rechazo"
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 520,
                minHeight: 260,
                paddingTop: 20,
                paddingBottom: 20,
                // `clamp` y no un 60px fijo: en una pantalla angosta 60px a cada lado
                // le comería casi todo el ancho al diálogo. Crece hasta 3.75rem (60px)
                // en pantallas anchas y baja a 1rem como mínimo en las chicas.
                paddingLeft: 'clamp(1rem, 5vw, 3.75rem)',
                paddingRight: 'clamp(1rem, 5vw, 3.75rem)',
                display: 'flex',
                flexDirection: 'column',
                // Los colores del mensaje de estado de error (`MensajeEstado`): fondo
                // #ffe9e9 y letra e icono #d90000, sin borde.
                background: '#ffe9e9',
                color: '#d90000',
                borderRadius: 16,
                boxShadow: '0 20px 40px -12px rgba(0,0,0,0.35)',
                textAlign: 'left',
              }}
            >
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  color: '#d90000',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                ✕
              </button>

              {/* Pegado arriba, fuera del bloque que se centra abajo. */}
              <p
                style={{
                  margin: 0,
                  paddingTop: 6,
                  paddingRight: 28,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                <IconoError />
                {titulo}
              </p>

              {/* El cuerpo se centra en el espacio que sobra, el título no. */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {motivo?.trim()
                    ? motivo
                    : 'El administrador no dejó un motivo escrito. Consúltalo antes de reenviar.'}
                </p>
                <p style={{ margin: '12px 0 0', fontSize: 12 }}>
                  Estás editando esa misma versión. Corrige y vuelve a enviarla a revisión.
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

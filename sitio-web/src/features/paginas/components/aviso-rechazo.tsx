'use client';

import { useEffect, useRef, useState } from 'react';
import { BellAlertIcon } from '@heroicons/react/24/outline';

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
 * Los estilos van en línea, como el resto de la cabecera del editor, porque este
 * árbol lo monta Puck y no hereda las clases del panel.
 */
export function AvisoRechazo({ motivo, numeroVersion }: Rechazo) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  // Cerrar al pulsar fuera o con Escape: el aviso se abre sobre el lienzo, y sin
  // esto tapa el contenido que el editor necesita ver para corregirlo.
  useEffect(() => {
    if (!abierto) return;

    const alPulsarFuera = (evento: MouseEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const alPulsarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAbierto(false);
    };

    document.addEventListener('mousedown', alPulsarFuera);
    document.addEventListener('keydown', alPulsarTecla);
    return () => {
      document.removeEventListener('mousedown', alPulsarFuera);
      document.removeEventListener('keydown', alPulsarTecla);
    };
  }, [abierto]);

  const titulo =
    numeroVersion === null ? 'Versión rechazada' : `Versión ${numeroVersion} rechazada`;

  return (
    <div ref={contenedor} style={{ position: 'relative', display: 'flex' }}>
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
          width: 34,
          height: 34,
          background: abierto ? '#fef3c7' : 'transparent',
          border: '1px solid #f59e0b',
          borderRadius: 6,
          color: '#b45309',
          cursor: 'pointer',
        }}
      >
        <BellAlertIcon style={{ width: 18, height: 18 }} />
        {/* Punto rojo: el aviso se ve sin tener que abrirlo. */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 7,
            height: 7,
            background: '#dc2626',
            borderRadius: '50%',
          }}
        />
      </button>

      {abierto && (
        <div
          role="dialog"
          aria-label="Motivo del rechazo"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 320,
            padding: 14,
            background: '#fff',
            border: '1px solid #fcd34d',
            borderRadius: 8,
            boxShadow: '0 10px 24px -8px rgba(0,0,0,0.25)',
            zIndex: 20,
            textAlign: 'left',
          }}
        >
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#92400e' }}>{titulo}</p>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 13,
              lineHeight: 1.5,
              color: '#374151',
              whiteSpace: 'pre-wrap',
            }}
          >
            {motivo?.trim()
              ? motivo
              : 'El administrador no dejó un motivo escrito. Consúltalo antes de reenviar.'}
          </p>
          <p style={{ margin: '10px 0 0', fontSize: 12, color: '#6b7280' }}>
            Estás editando esa misma versión. Corrige y vuelve a enviarla a revisión.
          </p>
        </div>
      )}
    </div>
  );
}

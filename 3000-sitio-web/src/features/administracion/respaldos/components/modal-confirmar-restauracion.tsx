'use client';

import { useEffect, useRef } from 'react';
import { Button, FormaDeModal } from '@/shared/ui/atoms/button';
import { MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';

/**
 * Las medidas son las de los demás modales del panel (`shared/ui/molecules/alert.tsx`):
 * caja con esquinas de 32, título de 20 px, texto de 16 y botones de 44 px de alto con
 * esquinas de 32 (los toman de `FormaDeModal`).
 */
export function ModalConfirmarRestauracion({
  abierto,
  versionAnteriorNumero,
  slug,
  numeroVersionActual,
  onConfirmar,
  onCancelar,
}: {
  abierto: boolean;
  versionAnteriorNumero: number;
  slug: string;
  numeroVersionActual: number;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogo.current;
    if (!el) return;
    if (abierto && !el.open) el.showModal();
    if (!abierto && el.open) el.close();
  }, [abierto]);

  return (
    <dialog
      ref={dialogo}
      onClose={onCancelar}
      // Usamos `onMouseDown` y no `onClick`: si el usuario selecciona texto
      // dentro del diálogo y suelta el ratón fuera, el clic se contabiliza en
      // el fondo y el diálogo se cerraba en mitad de la selección.
      onMouseDown={(e) => {
        if (e.target === dialogo.current) onCancelar();
      }}
      className="olo-anim-dialogo m-auto w-full max-w-md rounded-[32px] border-0 bg-white p-0 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.15)] backdrop:bg-[#0f172a]/40 backdrop:backdrop-blur-sm dark:bg-[#1e2538]"
    >
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <h2 className="m-0 text-xl font-semibold text-[#001631] dark:text-[#e6e8f0]">
          Restaurar versión anterior
        </h2>

        <p className="mt-2 text-base text-[#4b5563] dark:text-[#95a0b8]">
          Estás a punto de restaurar la versión <strong>{versionAnteriorNumero}</strong> de{' '}
          <strong>/{slug}</strong>.
        </p>

        <MensajeEstado tipo="advertencia" rol="note" className="mt-4">
          Esta acción publicará nuevamente la versión {versionAnteriorNumero} y pasará la
          versión actual ({numeroVersionActual}) al archivo histórico.
        </MensajeEstado>

        <FormaDeModal>
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <Button type="button" variant="plain" onClick={onCancelar}>
              Cancelar
            </Button>
            <Button type="button" variant="primary" onClick={onConfirmar}>
              Aceptar
            </Button>
          </div>
        </FormaDeModal>
      </div>
    </dialog>
  );
}

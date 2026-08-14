'use client';

import { useEffect, useRef } from 'react';
import { COLOR_ACCION, etiquetaDeAccion, etiquetaDeEntidad, type RegistroAuditoria } from '../types';

/** Un valor del JSONB puede ser texto, número, booleano u objeto. */
const comoTexto = (valor: unknown) => {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === 'string') return valor;
  return JSON.stringify(valor, null, 2);
};

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-zinc-500">{etiqueta}</dt>
      <dd className="mt-0.5 text-sm break-words text-zinc-900 dark:text-[#f6f6f6]">{children}</dd>
    </div>
  );
}

/**
 * Detalle de una entrada de la bitácora: qué cambió, desde dónde y con qué equipo.
 *
 * Es un `<dialog>` nativo por lo mismo que el modal de salida del editor: llega con
 * foco atrapado, cierre con Escape y capa superior propia, sin librería ni pelea
 * con el apilamiento del panel.
 */
export function DetalleRegistro({
  registro,
  onCerrar,
}: {
  registro: RegistroAuditoria | null;
  onCerrar: () => void;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogo.current;
    if (!el) return;
    if (registro && !el.open) el.showModal();
    if (!registro && el.open) el.close();
  }, [registro]);

  return (
    <dialog
      ref={dialogo}
      onClose={onCerrar}
      // Clic en el fondo = cerrar. El `<dialog>` recibe el clic del backdrop como
      // propio, así que se compara el objetivo con el propio diálogo.
      onClick={(e) => {
        if (e.target === dialogo.current) onCerrar();
      }}
      className="w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-0 text-zinc-900 backdrop:bg-black/50 dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:text-[#f6f6f6]"
    >
      {registro && (
        <div className="flex max-h-[80vh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5 dark:border-zinc-700">
            <div>
              <h2 className="admin-subtitle">Detalle del registro</h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                {new Date(registro.fecha).toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'medium' })}
              </p>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cerrar
            </button>
          </div>

          <div className="overflow-y-auto p-5">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Dato etiqueta="Usuario">
                {registro.usuarioNombre ?? <span className="text-zinc-500">Sin usuario registrado</span>}
              </Dato>
              <Dato etiqueta="Acción">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${COLOR_ACCION[registro.accion] ?? ''}`}>
                  {etiquetaDeAccion(registro.accion)}
                </span>
              </Dato>
              <Dato etiqueta="Entidad">{etiquetaDeEntidad(registro.entidadTipo)}</Dato>
              <Dato etiqueta="Identificador de la entidad">
                <code className="text-xs">{registro.entidadId}</code>
              </Dato>
              <Dato etiqueta="Dirección IP">{registro.ip ?? '—'}</Dato>
              <Dato etiqueta="Navegador">
                <span className="text-xs">{registro.userAgent ?? '—'}</span>
              </Dato>
            </dl>

            <h3 className="mt-6 text-sm font-semibold">Campos modificados</h3>
            {registro.camposModificados.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">
                Esta acción no registró campos concretos.
              </p>
            ) : (
              <>
                <ul className="mt-2 divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
                  {registro.camposModificados.map(({ campo, antes, despues }, i) => (
                    <li key={`${campo}-${i}`} className="p-3">
                      <p className="text-xs font-medium text-zinc-500">{campo}</p>
                      <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-zinc-400">Antes</p>
                          <p className="text-sm text-zinc-500">{comoTexto(antes) ?? 'sin registro'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-zinc-400">Después</p>
                          <pre className="whitespace-pre-wrap break-words text-sm">{comoTexto(despues) ?? '—'}</pre>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {/* El hueco se enseña en vez de disimularse: hoy el backend no
                    guarda el estado anterior (T-07.6). */}
                <p className="mt-2 text-xs text-zinc-500">
                  El sistema todavía no guarda el valor anterior de cada campo, por eso «Antes»
                  aparece sin registro.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

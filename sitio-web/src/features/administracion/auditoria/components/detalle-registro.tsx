'use client';

import { useEffect, useRef, useState } from 'react';
import { COLOR_ACCION, etiquetaDeAccion, etiquetaDeEntidad, etiquetaDeCampo, type RegistroAuditoria } from '../types';

/** Un valor del JSONB puede ser texto, número, booleano u objeto. */
const comoTexto = (valor: unknown) => {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === 'string') return valor;
  return JSON.stringify(valor, null, 2);
};

/** Traduce valores de estados internos a texto legible. */
const ETIQUETA_ESTADO: Record<string, string> = {
  borrador: 'Borrador',
  en_revision: 'En revisión',
  publicado: 'Publicado',
  archivado: 'Archivado',
  rechazado: 'Rechazado',
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido',
};

const traducirEstado = (v: string) => ETIQUETA_ESTADO[v] ?? v;

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
function useNombresRoles() {
  const [diccionario, setDiccionario] = useState<Record<string, string>>({});
  useEffect(() => {
    fetch('/api/roles', { headers: { 'Cache-Control': 'no-cache' } })
      .then((res) => (res.ok ? res.json() : []))
      .then((roles) => {
        const dict: Record<string, string> = {};
        for (const r of roles) dict[r.id] = r.name;
        setDiccionario(dict);
      })
      .catch(() => {});
  }, []);
  return diccionario;
}

import type { UsuarioDeFiltro } from '../services/auditoria.service';

export function DetalleRegistro({
  registro,
  usuarios = [],
  onCerrar,
}: {
  registro: RegistroAuditoria | null;
  usuarios?: UsuarioDeFiltro[];
  onCerrar: () => void;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const nombresRoles = useNombresRoles();

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
      className="m-auto w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-0 text-zinc-900 backdrop:bg-black/50 dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:text-[#f6f6f6]"
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
                {(registro?.usuarioId ? usuarios?.find(u => u.id === registro.usuarioId)?.nombre : null) ?? registro?.usuarioNombre ?? <span className="text-zinc-500">Sin usuario registrado</span>}
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
                  {registro.camposModificados.map(({ campo, antes, despues }, i) => {
                    let antesStr = comoTexto(antes) ?? 'sin registro';
                    let despuesStr = comoTexto(despues) ?? '—';
                    if (campo === 'role_id') {
                      if (antes && typeof antes === 'string' && nombresRoles[antes]) antesStr = nombresRoles[antes];
                      if (despues && typeof despues === 'string' && nombresRoles[despues]) despuesStr = nombresRoles[despues];
                    } else if (campo === 'estado' || campo === 'status') {
                      if (antes && typeof antes === 'string') antesStr = traducirEstado(antes);
                      if (despues && typeof despues === 'string') despuesStr = traducirEstado(despues);
                    }
                    return (
                      <li key={`${campo}-${i}`} className="p-3">
                        <p className="text-xs font-medium text-zinc-500">{etiquetaDeCampo(campo)}</p>
                        <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-medium text-zinc-400">Antes</p>
                            <p className="text-sm text-zinc-500">{antesStr}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-zinc-400">Después</p>
                            <pre className="whitespace-pre-wrap break-words text-sm">{despuesStr}</pre>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

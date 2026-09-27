'use client';

import { useEffect, useRef, useState } from 'react';
import { COLOR_ACCION, etiquetaDeAccion, etiquetaDeEntidad, etiquetaDeCampo, type RegistroAuditoria } from '../types';
import { comentariosDe, explicacionDeComentarios, type ComentariosDelRegistro } from '../lib/cambios';

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
  // El portal desde el que se inició sesión (campo `origen` de las filas de login).
  'sitio-web': 'Sitio web',
  intranet: 'Intranet',
};

const traducirEstado = (v: string) => ETIQUETA_ESTADO[v] ?? v;

/** Un comentario, o el aviso de que esa versión no tenía. */
function TextoComentario({ texto, destacado }: { texto: string | null; destacado?: boolean }) {
  if (!texto) return <p className="text-sm italic text-zinc-500">Sin comentario</p>;
  return (
    <p
      className={`text-sm break-words ${
        destacado ? 'font-semibold text-zinc-900 dark:text-[#f6f6f6]' : 'text-zinc-700 dark:text-zinc-300'
      }`}
    >
      «{texto}»
    </p>
  );
}

/**
 * Los campos modificados de un registro del ciclo editorial.
 *
 * Sustituye a la lista de `slug`, `version` y `estado`, que no decía qué había
 * cambiado: aquí se lee el comentario de lo que estaba publicado frente al de la
 * versión sobre la que se actuó. El motivo se conserva porque en un rechazo o un
 * descarte es la otra mitad de la historia.
 */
function ComentariosDelCambio({
  comentarios,
  explicacion,
  esRechazo,
}: {
  comentarios: ComentariosDelRegistro;
  explicacion: string | null;
  esRechazo: boolean;
}) {
  return (
    <>
      {explicacion && <p className="mt-1 text-xs text-zinc-500">{explicacion}</p>}
      <ul className="mt-2 divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
        <li className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-zinc-500">Comentario anterior</p>
            <div className="mt-1">
              <TextoComentario texto={comentarios.anterior} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500">Comentario después</p>
            <div className="mt-1">
              <TextoComentario texto={comentarios.despues} destacado />
            </div>
          </div>
        </li>
        {comentarios.motivo && (
          <li className="p-3">
            <p className="text-xs font-medium text-zinc-500">{esRechazo ? 'Motivo del rechazo' : 'Motivo'}</p>
            <p className="mt-1 text-sm break-words text-zinc-900 dark:text-[#f6f6f6]">{comentarios.motivo}</p>
          </li>
        )}
      </ul>
      {comentarios.anteriorALaRegla && (
        <p className="mt-2 text-xs text-zinc-500">
          Este registro es anterior a que el comentario de cambios fuera obligatorio.
        </p>
      )}
    </>
  );
}

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

function formatearBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = 2;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function parsearBytesTexto(texto: unknown): number {
  if (typeof texto === 'number') return texto;
  if (typeof texto !== 'string') return 0;
  const match = texto.match(/([\d.]+)\s*(B|KB|MB|GB)?/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unidad = (match[2] || 'B').toUpperCase();
  if (unidad === 'GB') return num * 1024 * 1024 * 1024;
  if (unidad === 'MB') return num * 1024 * 1024;
  if (unidad === 'KB') return num * 1024;
  return num;
}

/** En depuración de versiones, normaliza para mostrar únicamente el peso de la tabla antes y después. */
function normalizarCamposModificados(campos: { campo: string; antes: unknown; despues: unknown }[]) {
  // Si ya contiene directamente 'peso_tabla', dejamos únicamente esa métrica
  const tienePesoTabla = campos.some((c) => c.campo === 'peso_tabla');
  if (tienePesoTabla) {
    return campos.filter((c) => c.campo === 'peso_tabla');
  }

  // Detectar si es una depuración de versiones (sea por objeto histórico o por espacio_liberado sin slug de sección)
  const esDepuracion = campos.some(
    (c) =>
      c.campo === 'depuracion_versiones_antiguas' ||
      (c.campo === 'espacio_liberado' && !campos.some((x) => x.campo === 'slug'))
  );

  if (esDepuracion) {
    const itemAntiguo = campos.find((c) => c.campo === 'depuracion_versiones_antiguas');
    let bytesLiberados = 0;

    if (itemAntiguo?.antes && typeof itemAntiguo.antes === 'object') {
      const d = itemAntiguo.antes as Record<string, unknown>;
      if (d.pesoAntes !== undefined && d.pesoDespues !== undefined) {
        return [
          {
            campo: 'peso_tabla',
            antes: typeof d.pesoAntes === 'number' ? formatearBytes(d.pesoAntes) : d.pesoAntes,
            despues: typeof d.pesoDespues === 'number' ? formatearBytes(d.pesoDespues) : d.pesoDespues,
          },
        ];
      }
      bytesLiberados = Number(d.bytesLiberados || 0);
    } else {
      const itemEspacio = campos.find((c) => c.campo === 'espacio_liberado');
      if (itemEspacio) {
        bytesLiberados = parsearBytesTexto(itemEspacio.antes);
      }
    }

    const pesoTablaBase = 238850;
    const pesoAntes = pesoTablaBase + bytesLiberados;
    const pesoDespues = pesoTablaBase;

    return [
      {
        campo: 'peso_tabla',
        antes: formatearBytes(pesoAntes),
        despues: formatearBytes(pesoDespues),
      },
    ];
  }

  return campos;
}

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

  const camposNormalizados = registro ? normalizarCamposModificados(registro.camposModificados) : [];
  // Del ciclo editorial: en vez de slug, versión y estado, el comentario de cambios.
  const comentarios = registro ? comentariosDe(registro) : null;

  return (
    <dialog
      ref={dialogo}
      onClose={onCerrar}
      onMouseDown={(e) => {
        if (e.target === dialogo.current) onCerrar();
      }}
      className="m-auto w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-0 text-zinc-900 backdrop:bg-[#0f172a]/50 backdrop:backdrop-blur-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:text-[#f6f6f6]"
    >
      {registro && (
        <div className="flex max-h-[80dvh] flex-col">
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
                {(registro?.usuarioId ? usuarios?.find((u) => u.id === registro.usuarioId)?.nombre : null) ??
                  registro?.usuarioNombre ?? <span className="text-zinc-500">Sin usuario registrado</span>}
              </Dato>
              <Dato etiqueta="Acción">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    COLOR_ACCION[registro.accion] ?? ''
                  }`}
                >
                  {etiquetaDeAccion(registro.accion, registro.categoria)}
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
            {comentarios ? (
              <ComentariosDelCambio
                comentarios={comentarios}
                explicacion={explicacionDeComentarios(registro)}
                esRechazo={registro.accion === 'rechazar'}
              />
            ) : camposNormalizados.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">Esta acción no registró campos concretos.</p>
            ) : (
              <ul className="mt-2 divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
                {camposNormalizados.map(({ campo, antes, despues }, i) => {
                  let antesStr = comoTexto(antes) ?? '—';
                  let despuesStr = comoTexto(despues) ?? '—';
                  if (campo === 'role_id') {
                    if (antes && typeof antes === 'string' && nombresRoles[antes]) antesStr = nombresRoles[antes];
                    if (despues && typeof despues === 'string' && nombresRoles[despues])
                      despuesStr = nombresRoles[despues];
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
                          <p className="text-sm font-semibold text-zinc-900 dark:text-[#f6f6f6]">{despuesStr}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

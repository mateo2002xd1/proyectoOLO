'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { IconoMascara } from '@/shared/ui/atoms/icono-mascara';
import { BarraFiltros, CampoFiltro } from '@/shared/ui/molecules/barra-filtros';
import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import { DatePicker } from '@/shared/ui/molecules/date-picker';
import { EncabezadoPanel } from '@/shared/ui/molecules/encabezado-panel';
import { Paginador } from '@/shared/ui/molecules/paginador';
import { useRevisionQueue } from '../hooks/use-revision-queue';
import type { PaginaEnRevision } from '../../model/pagina.types';
import { CargandoSeccion } from '@/shared/ui/molecules/cargando-seccion';

/**
 * Dónde se ve una página que aún no está publicada.
 *
 * Cada aplicación dibuja sus propios bloques, así que el sitio no sabe pintar una
 * página de la intranet: la vista previa se abre en la aplicación a la que
 * pertenece. La sesión es la misma en ambas, así que no vuelve a pedir acceso.
 */
const URL_INTRANET = process.env.NEXT_PUBLIC_INTRANET_URL || 'http://localhost:3001';

function enlaceDeVistaPrevia(pagina: PaginaEnRevision): string {
  return pagina.ambito === 'intranet'
    ? `${URL_INTRANET}/preview/${pagina.slug}`
    : `/preview/${pagina.slug}`;
}



const BOTON =
  'flex h-11 items-center justify-center gap-2 rounded-[16px] border border-transparent px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 @3xl:h-9 @3xl:w-12 @3xl:px-0';

const fecha = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
};

const normalizar = (t: string) =>
  t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

const FILTROS_VACIOS = { busqueda: '', ambito: '', autor: '', desde: '', hasta: '' };

export function RevisionQueueView() {
  const { paginas, isLoading, error, aprobar, rechazar, eliminar } = useRevisionQueue();
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  // Nombrado "numeroPagina" y no "pagina": ese nombre ya lo usa cada fila de la
  // tabla para la página-contenido (`PaginaEnRevision`), y las dos cosas conviven
  // en este mismo archivo.
  const [numeroPagina, setNumeroPagina] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(15);

  const cambiarFiltro = (campo: keyof typeof FILTROS_VACIOS, valor: string) => {
    setFiltros((previos) => ({ ...previos, [campo]: valor }));
    setNumeroPagina(1);
  };

  // El autor sale de lo ya cargado, no de un catálogo aparte: esta cola no tiene
  // (todavía) un endpoint propio de usuarios como sí tiene Auditoría.
  const autores = useMemo(
    () => [...new Set(paginas.map((p) => p.autor?.nombre).filter((n): n is string => Boolean(n)))].sort((a, b) => a.localeCompare(b, 'es')),
    [paginas]
  );

  const paginasFiltradas = useMemo(() => {
    const q = normalizar(filtros.busqueda);
    return paginas.filter((p) => {
      if (q && !normalizar(`${p.titulo} ${p.slug} ${p.comentario ?? ''}`).includes(q)) return false;
      if (filtros.ambito && p.ambito !== filtros.ambito) return false;
      if (filtros.autor && p.autor?.nombre !== filtros.autor) return false;
      // Comparación de texto sobre `YYYY-MM-DD...`: válida porque la fecha es la
      // parte más significativa al principio del ISO, sin necesidad de parsear.
      if (filtros.desde && p.creadoEn.slice(0, 10) < filtros.desde) return false;
      if (filtros.hasta && p.creadoEn.slice(0, 10) > filtros.hasta) return false;
      return true;
    });
  }, [paginas, filtros]);

  const hayFiltros = Object.values(filtros).some(Boolean);

  const totalPaginas = Math.max(1, Math.ceil(paginasFiltradas.length / itemsPorPagina));
  const paginaActual = Math.min(numeroPagina, totalPaginas);
  const paginasPagina = paginasFiltradas.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const [modalState, setModalState] = useState<{
    tipo: 'rechazar' | 'eliminar' | null;
    pagina: PaginaEnRevision | null;
  }>({ tipo: null, pagina: null });

  function abrirRechazar(pagina: PaginaEnRevision) {
    setModalState({ tipo: 'rechazar', pagina });
  }

  function abrirEliminar(pagina: PaginaEnRevision) {
    setModalState({ tipo: 'eliminar', pagina });
  }

  async function confirmarModal(motivo: string) {
    if (!modalState.pagina || !modalState.tipo) return;
    const { pagina, tipo } = modalState;
    setModalState({ tipo: null, pagina: null });
    setBusySlug(pagina.slug);

    try {
      if (tipo === 'rechazar') {
        await rechazar(pagina.slug, motivo, pagina.ambito);
      } else if (tipo === 'eliminar') {
        await eliminar(pagina.slug, pagina.id, motivo, pagina.ambito);
      }
    } finally {
      setBusySlug(null);
    }
  }

  async function handleAprobar(pagina: PaginaEnRevision) {
    setBusySlug(pagina.slug);
    try {
      await aprobar(pagina.slug, pagina.ambito);
    } finally {
      setBusySlug(null);
    }
  }

  return (
    <div className="px-4 py-6 sm:p-6 lg:p-8">
      <EncabezadoPanel
        titulo="Páginas en revisión"
        descripcion="Borradores enviados por editores del sitio y de la intranet, pendientes de aprobación."
      />

      {!isLoading && paginas.length > 0 && (
        <BarraFiltros activos={Object.values(filtros).filter(Boolean).length}>
          <CampoFiltro etiqueta="Página">
            <input
              type="search"
              value={filtros.busqueda}
              onChange={(e) => cambiarFiltro('busqueda', e.target.value)}
              placeholder="Título, slug o comentario…"
              className="h-11 w-full rounded-[16px] border border-[#d0d5dd] bg-white px-3 text-sm text-zinc-900 placeholder:text-[#8a95ad] focus:border-[#002237] focus:outline-none focus:ring-2 focus:ring-[#002237]/20 dark:border-[#2d3649] dark:bg-[#252f47] dark:text-[#e6e8f0]"
            />
          </CampoFiltro>

          <CampoFiltro etiqueta="Ámbito">
            <CustomSelect
              ariaLabel="Ámbito"
              value={filtros.ambito}
              onChange={(valor) => cambiarFiltro('ambito', valor)}
              options={[
                { value: '', label: 'Todos' },
                { value: 'sitio', label: 'Sitio web' },
                { value: 'intranet', label: 'Intranet' },
              ]}
            />
          </CampoFiltro>

          <CampoFiltro etiqueta="Autor">
            <CustomSelect
              ariaLabel="Autor"
              value={filtros.autor}
              onChange={(valor) => cambiarFiltro('autor', valor)}
              options={[{ value: '', label: 'Todos' }, ...autores.map((n) => ({ value: n, label: n }))]}
            />
          </CampoFiltro>

          <CampoFiltro etiqueta="Enviado desde">
            <DatePicker
              ariaLabel="Enviado desde"
              value={filtros.desde}
              max={filtros.hasta || undefined}
              onChange={(valor) => cambiarFiltro('desde', valor)}
            />
          </CampoFiltro>

          <CampoFiltro etiqueta="Enviado hasta">
            <DatePicker
              ariaLabel="Enviado hasta"
              value={filtros.hasta}
              min={filtros.desde || undefined}
              onChange={(valor) => cambiarFiltro('hasta', valor)}
            />
          </CampoFiltro>

          {hayFiltros && (
            <button
              type="button"
              onClick={() => setFiltros(FILTROS_VACIOS)}
              className="h-11 rounded-[16px] border border-[#d0d5dd] px-4 text-sm font-medium text-zinc-700 transition hover:border-[#002237]/40 hover:bg-[#002237]/5 hover:text-[#002237] dark:border-[#2d3649] dark:text-zinc-200 dark:hover:bg-white/5 dark:hover:text-[#f6f6f6]"
            >
              Limpiar filtros
            </button>
          )}
        </BarraFiltros>
      )}

      {error ? (
        <p className="text-sm text-red-600">Error: {error}</p>
      ) : isLoading ? (
        <CargandoSeccion label="Cargando páginas en revisión..." className="min-h-[40vh]" />
      ) : paginas.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No hay páginas pendientes de revisión. Cuando los editores envíen borradores, aparecerán aquí para tu aprobación.
        </p>
      ) : paginasFiltradas.length === 0 ? (
        <p className="text-sm text-zinc-500">Ninguna página coincide con los filtros aplicados.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-[#7db828]/30">
          <table className="olo-tabla-apilable w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-[#131b2f]">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Página</th>
                <th scope="col" className="px-4 py-3 font-medium">Ámbito</th>
                <th scope="col" className="px-4 py-3 font-medium">Autor</th>
                <th scope="col" className="px-4 py-3 font-medium">Enviado el</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {paginasPagina.map((pagina) => (
                <tr key={pagina.id} className="bg-white dark:bg-[#0f1626] transition-colors hover:bg-zinc-50/60 dark:hover:bg-[#131b2f]/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900 dark:text-[#f6f6f6]">{pagina.titulo}</p>
                    <p className="text-xs text-zinc-500">/{pagina.slug} · versión {pagina.numeroVersion}</p>
                    {/* Lo que el editor dice que cambió: se lee antes de decidir, como la
                        descripción de un pull request. */}
                    {pagina.comentario && (
                      <p className="mt-1 max-w-md text-sm text-zinc-700 dark:text-zinc-300">
                        «{pagina.comentario}»
                      </p>
                    )}
                  </td>
                  <td data-etiqueta="Ámbito" className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        pagina.ambito === 'intranet'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}
                    >
                      {pagina.ambito === 'intranet' ? 'Intranet' : 'Sitio web'}
                    </span>
                  </td>
                  <td data-etiqueta="Autor" className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    <p className="text-sm">{pagina.autor?.nombre || 'Desconocido'}</p>
                    {pagina.autor?.email && (
                      <p className="text-xs text-zinc-400">{pagina.autor.email}</p>
                    )}
                  </td>
                  <td data-etiqueta="Enviado el" className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    {fecha(pagina.creadoEn)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {/* Con la tabla en tarjetas cada botón dice lo que hace, en una rejilla de 2×2: el
                        `title` no aparece en una pantalla táctil y cuatro iconos solos no
                        se distinguen. Con la tabla completa, el texto queda para el lector de pantalla.
                        Tonos 600-700 y no 500: el blanco sobre verde o amarillo 500 no llega
                        al 3:1 ni para un icono. */}
                    <div className="grid grid-cols-2 gap-2 @3xl:flex @3xl:items-center @3xl:justify-end">
                      <a
                        href={enlaceDeVistaPrevia(pagina)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver página"
                        className={`group ${BOTON} bg-[#1FACE3] text-white hover:brightness-95 focus:ring-[#1FACE3]/50`}
                      >
                        <span className="relative inline-block h-6 w-6">
                          <span className="absolute inset-0 flex items-center justify-center group-hover:hidden group-focus-visible:hidden"><IconoMascara nombre="eye-closed" tamano="h-6 w-6" /></span>
                          <span className="absolute inset-0 hidden items-center justify-center group-hover:flex group-focus-visible:flex"><IconoMascara nombre="eye-open" tamano="h-6 w-6" /></span>
                        </span>
                        <span className="@3xl:sr-only">Ver página</span>
                      </a>
                      <button
                        type="button"
                        disabled={busySlug === pagina.slug}
                        onClick={() => handleAprobar(pagina)}
                        title="Aprobar"
                        className={`${BOTON} bg-[#7DB728] text-white hover:brightness-95 focus:ring-[#7DB728]/50 disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <IconoMascara nombre="send" />
                        <span className="@3xl:sr-only">Aprobar</span>
                      </button>
                      <button
                        type="button"
                        disabled={busySlug === pagina.slug}
                        onClick={() => abrirRechazar(pagina)}
                        title="Rechazar"
                        className={`${BOTON} border-[#FF1F1F] bg-[#FFE9E9] text-[#FF1F1F] hover:brightness-95 focus:ring-[#FF1F1F]/50 disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <IconoMascara nombre="equiz" />
                        <span className="@3xl:sr-only">Rechazar</span>
                      </button>
                      <button
                        type="button"
                        disabled={busySlug === pagina.slug}
                        onClick={() => abrirEliminar(pagina)}
                        title="Descartar esta versión sin publicar"
                        className={`${BOTON} bg-[#FF1F1F] text-white hover:brightness-95 focus:ring-[#FF1F1F]/50 disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <IconoMascara nombre="trash" tamano="h-5 w-5" />
                        <span className="@3xl:sr-only">Descartar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Paginador
            pagina={paginaActual}
            totalPaginas={totalPaginas}
            onCambiarPagina={setNumeroPagina}
            total={paginasFiltradas.length}
            porPagina={itemsPorPagina}
            onCambiarPorPagina={(n) => {
              setItemsPorPagina(n);
              setNumeroPagina(1);
            }}
            etiqueta="páginas"
            className="px-4"
          />
        </div>
      )}

      {/* `key` por versión: cada página abre un modal nuevo, con el motivo en blanco. */}
      <ModalAccionConMotivo
        key={`rechazar-${modalState.pagina?.id ?? 'cerrado'}`}
        abierto={modalState.tipo === 'rechazar'}
        titulo={modalState.pagina ? `Rechazar versión ${modalState.pagina.numeroVersion}` : ''}
        descripcion={`Se devolverá el borrador a su autor original (${modalState.pagina?.autor?.nombre || 'desconocido'}) para que lo corrija.`}
        textoAccion="Rechazar"
        colorAccion="red"
        onConfirmar={confirmarModal}
        onCancelar={() => setModalState({ tipo: null, pagina: null })}
      />

      <ModalAccionConMotivo
        key={`eliminar-${modalState.pagina?.id ?? 'cerrado'}`}
        abierto={modalState.tipo === 'eliminar'}
        titulo={modalState.pagina ? `Eliminar versión ${modalState.pagina.numeroVersion} de /${modalState.pagina.slug}` : ''}
        descripcion="Se descarta el trabajo sin publicar. Si es la única versión de la página, la próxima edición empezará de nuevo desde la versión 1."
        textoAccion="Eliminar"
        colorAccion="red"
        onConfirmar={confirmarModal}
        onCancelar={() => setModalState({ tipo: null, pagina: null })}
      />
    </div>
  );
}

function ModalAccionConMotivo({
  abierto,
  titulo,
  descripcion,
  textoAccion,
  colorAccion = 'red',
  onConfirmar,
  onCancelar,
  requiereMotivo = true,
}: {
  abierto: boolean;
  titulo: string;
  descripcion: string;
  textoAccion: string;
  colorAccion?: 'red' | 'brand';
  onConfirmar: (motivo: string) => void;
  onCancelar: () => void;
  requiereMotivo?: boolean;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [motivo, setMotivo] = useState('');

  // Solo abre y cierra el `<dialog>`; no vacía `motivo`. De eso se encarga la `key` por
  // página que pone el padre: cada versión estrena modal y el campo nace vacío, en vez
  // de mostrar durante un frame el motivo escrito para la página anterior.
  useEffect(() => {
    const el = dialogo.current;
    if (!el) return;
    if (abierto) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
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
      className="m-auto w-full max-w-md rounded-xl border border-zinc-200 bg-white p-0 text-zinc-900 backdrop:bg-[#0f172a]/50 backdrop:backdrop-blur-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:text-[#f6f6f6]"
    >
      <div className="flex flex-col p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-[#f6f6f6]">
            {titulo}
          </h2>
        </div>

        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{descripcion}</p>

        {requiereMotivo && (
          <div className="mt-4">
            <label
              htmlFor="motivo-accion"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              Motivo (obligatorio)
            </label>
            <textarea
              id="motivo-accion"
              rows={3}
              className="mt-1 block w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:border-brand-interactive focus:outline-none focus:ring-1 focus:ring-brand-interactive dark:border-zinc-700 dark:bg-[#1a233a] dark:text-white"
              placeholder="Explica la razón…"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              autoFocus
            />
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancelar}
            className="inline-flex w-full justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-brand-interactive/50 sm:w-auto dark:border-zinc-600 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirmar(motivo)}
            disabled={requiereMotivo && !motivo.trim()}
            className={`inline-flex w-full justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${
              colorAccion === 'red'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-brand-interactive hover:bg-brand-interactive-hover'
            }`}
          >
            {textoAccion}
          </button>
        </div>
      </div>
    </dialog>
  );
}

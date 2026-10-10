'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { IconoMascara } from '@/shared/ui/atoms/icono-mascara';
import { BarraFiltros, CampoFiltro } from '@/shared/ui/molecules/barra-filtros';
import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import { DatePicker } from '@/shared/ui/molecules/date-picker';
import { EncabezadoPanel } from '@/shared/ui/molecules/encabezado-panel';
import { Paginador } from '@/shared/ui/molecules/paginador';
import { useRevisionQueue } from '../hooks/use-revision-queue';
import type { PaginaEnRevision } from '../../model/pagina.types';
import { CargandoSeccion } from '@/shared/ui/molecules/cargando-seccion';
import { GRUPO_TOOLTIP, TOOLTIP_ENCIMA } from '@/shared/ui/atoms/tooltip';
import { AvisoErrorDeCarga } from '@/shared/ui/molecules/aviso-error-de-carga';

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
  `${GRUPO_TOOLTIP} flex h-11 items-center justify-center gap-2 rounded-[16px] border border-transparent px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 @3xl:h-9 @3xl:w-12 @3xl:px-0`;

/**
 * El nombre de cada acción, del color de su botón (ver `shared/ui/atoms/tooltip.ts`).
 * Solo con la tabla completa: en tarjetas el botón ya lleva el nombre escrito.
 *
 * Letra blanca, como el icono de su botón: así lo pidió el usuario. No llega al 4,5:1 que
 * pide un texto de 12 px (9-accesibilidad.md §2.1): sobre el azul da 2,6:1, sobre el verde
 * 2,4:1 y sobre el rojo 3,8:1. Con `#0d1526` darían 7,0, 7,5 y 4,7:1.
 */
const TOOLTIP = `${TOOLTIP_ENCIMA} hidden @3xl:block`;

const fecha = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
};

const FILTROS_VACIOS = { ambito: '', autor: '', desde: '', hasta: '' };

export function RevisionQueueView() {
  const { paginas, isLoading, error, reintentar, aprobar, rechazar, eliminar } = useRevisionQueue();
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  // Nombrado "numeroPagina" y no "pagina": ese nombre ya lo usa cada fila de la
  // tabla para la página-contenido (`PaginaEnRevision`), y las dos cosas conviven
  // en este mismo archivo.
  const [numeroPagina, setNumeroPagina] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(15);
  // Filas desplegadas del acordeón (móvil y tablet). En la tabla de escritorio no se usa.
  const [abiertas, setAbiertas] = useState<Set<string>>(() => new Set());
  const alternarFila = (id: string) =>
    setAbiertas((previas) => {
      const nuevas = new Set(previas);
      if (nuevas.has(id)) nuevas.delete(id);
      else nuevas.add(id);
      return nuevas;
    });

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
    return paginas.filter((p) => {
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
    tipo: 'aprobar' | 'rechazar' | 'eliminar' | null;
    pagina: PaginaEnRevision | null;
  }>({ tipo: null, pagina: null });

  function abrirAprobar(pagina: PaginaEnRevision) {
    setModalState({ tipo: 'aprobar', pagina });
  }

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
      if (tipo === 'aprobar') {
        await aprobar(pagina.slug, pagina.ambito);
      } else if (tipo === 'rechazar') {
        await rechazar(pagina.slug, motivo, pagina.ambito);
      } else if (tipo === 'eliminar') {
        await eliminar(pagina.slug, pagina.id, motivo, pagina.ambito);
      }
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
        <AvisoErrorDeCarga
          titulo="No pudimos cargar las páginas en revisión"
          mensaje={error}
          onReintentar={reintentar}
          reintentando={isLoading}
        />
      ) : isLoading ? (
        <CargandoSeccion label="Cargando páginas en revisión..." />
      ) : paginas.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No hay páginas pendientes de revisión. Cuando los editores envíen borradores, aparecerán aquí para tu aprobación.
        </p>
      ) : paginasFiltradas.length === 0 ? (
        <p className="text-sm text-zinc-500">Ninguna página coincide con los filtros aplicados.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-[#7db828]/30">
          {/* En el móvil y la tablet, acordeón: cada solicitud es una línea («Ana envió la
              versión 3 de Contacto») y al tocarla se despliegan los cambios, el resto de datos
              y las acciones. Con muchas solicitudes, las tarjetas enteras hacían eterno el
              scroll. Las reglas, en globals.css (`olo-tabla-acordeon`). */}
          <table className="olo-tabla-apilable olo-tabla-acordeon w-full min-w-[64rem] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-[#131b2f]">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Página</th>
                <th scope="col" className="px-4 py-3 font-medium">Cambios</th>
                <th scope="col" className="px-4 py-3 font-medium">Ámbito</th>
                <th scope="col" className="px-4 py-3 font-medium">Autor</th>
                <th scope="col" className="px-4 py-3 font-medium">Enviado el</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {paginasPagina.map((pagina) => {
                const abierta = abiertas.has(pagina.id);
                return (
                <tr
                  key={pagina.id}
                  data-abierta={abierta || undefined}
                  className="bg-white dark:bg-[#0f1626] transition-colors hover:bg-zinc-50/60 dark:hover:bg-[#131b2f]/50"
                >
                  {/* Solo en acordeón (en la tabla, `display: none`): la frase de la fila. */}
                  <td data-resumen>
                    <button
                      type="button"
                      aria-expanded={abierta}
                      onClick={() => alternarFila(pagina.id)}
                      className="flex min-h-11 w-full items-center gap-3 rounded-[16px] py-1.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#001631] dark:focus-visible:ring-white"
                    >
                      <span className="min-w-0 flex-1 text-sm leading-5 text-zinc-600 dark:text-zinc-300">
                        <span className="font-semibold text-zinc-900 dark:text-[#f6f6f6]">
                          {pagina.autor?.nombre || 'Alguien'}
                        </span>{' '}
                        envió la versión {pagina.numeroVersion} de{' '}
                        <span className="font-semibold text-zinc-900 dark:text-[#f6f6f6]">{pagina.titulo}</span>
                      </span>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className={`size-5 shrink-0 text-zinc-500 transition-transform duration-200 motion-reduce:transition-none dark:text-zinc-400 ${abierta ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </td>
                  <td data-solo-tabla className="px-4 py-3">
                    <p className="font-medium text-zinc-900 dark:text-[#f6f6f6]">
                      {pagina.titulo}
                      <span className="font-normal text-zinc-500"> · versión {pagina.numeroVersion}</span>
                    </p>
                  </td>
                  {/* Lo que el editor dice que cambió: se lee antes de decidir, como la
                      descripción de un pull request. */}
                  <td data-etiqueta="Cambios" className="px-4 py-3">
                    {pagina.comentario ? (
                      <p className="max-w-md text-sm text-zinc-700 dark:text-zinc-300">«{pagina.comentario}»</p>
                    ) : (
                      <p className="text-sm text-zinc-400">Sin comentario</p>
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
                        className={`group ${BOTON} bg-[#1FACE3] text-white hover:brightness-95 focus:ring-[#1FACE3]/50`}
                      >
                        <span className="relative inline-block h-6 w-6">
                          <span className="absolute inset-0 flex items-center justify-center group-hover:hidden group-focus-visible:hidden"><IconoMascara nombre="eye-closed" tamano="h-6 w-6" /></span>
                          <span className="absolute inset-0 hidden items-center justify-center group-hover:flex group-focus-visible:flex"><IconoMascara nombre="eye-open" tamano="h-6 w-6" /></span>
                        </span>
                        <span className="@3xl:sr-only">Visualizar</span>
                        <span aria-hidden="true" className={`${TOOLTIP} bg-[#1FACE3] text-white`}>Visualizar</span>
                      </a>
                      <button
                        type="button"
                        disabled={busySlug === pagina.slug}
                        onClick={() => abrirAprobar(pagina)}
                        className={`${BOTON} bg-[#7DB728] text-white hover:brightness-95 focus:ring-[#7DB728]/50 disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <IconoMascara nombre="send" />
                        <span className="@3xl:sr-only">Aprobar</span>
                        <span aria-hidden="true" className={`${TOOLTIP} bg-[#7DB728] text-white`}>Aprobar</span>
                      </button>
                      <button
                        type="button"
                        disabled={busySlug === pagina.slug}
                        onClick={() => abrirRechazar(pagina)}
                        className={`${BOTON} border-[#FF1F1F] bg-[#FFE9E9] text-[#FF1F1F] hover:brightness-95 focus:ring-[#FF1F1F]/50 disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <IconoMascara nombre="equiz" />
                        <span className="@3xl:sr-only">Rechazar</span>
                        {/* `#d11a1a` y no el `#FF1F1F` del icono: sobre el rosa da 4,7:1; el del icono, 3,3:1. */}
                        <span aria-hidden="true" className={`${TOOLTIP} border border-[#FF1F1F] bg-[#FFE9E9] text-[#d11a1a]`}>Rechazar</span>
                      </button>
                      <button
                        type="button"
                        disabled={busySlug === pagina.slug}
                        onClick={() => abrirEliminar(pagina)}
                        className={`${BOTON} bg-[#FF1F1F] text-white hover:brightness-95 focus:ring-[#FF1F1F]/50 disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <IconoMascara nombre="trash" tamano="h-5 w-5" />
                        <span className="@3xl:sr-only">Eliminar</span>
                        <span aria-hidden="true" className={`${TOOLTIP} bg-[#FF1F1F] text-white`}>Eliminar</span>
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
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
      {/* Publicar reemplaza lo que ve el público: se confirma antes, como rechazar y eliminar. */}
      <ModalAccionConMotivo
        key={`aprobar-${modalState.pagina?.id ?? 'cerrado'}`}
        abierto={modalState.tipo === 'aprobar'}
        titulo="¿Estás seguro de que deseas publicar esta versión?"
        descripcion={
          modalState.pagina
            ? `Se publicará la versión ${modalState.pagina.numeroVersion} de ${modalState.pagina.slug} en ${
                modalState.pagina.ambito === 'intranet' ? 'la intranet' : 'el sitio web'
              }. Si ya hay una versión publicada, pasará a Respaldos.`
            : ''
        }
        textoAccion="Publicar"
        colorAccion="brand"
        requiereMotivo={false}
        onConfirmar={confirmarModal}
        onCancelar={() => setModalState({ tipo: null, pagina: null })}
      />

      <ModalAccionConMotivo
        key={`rechazar-${modalState.pagina?.id ?? 'cerrado'}`}
        abierto={modalState.tipo === 'rechazar'}
        titulo={modalState.pagina ? `Rechazar versión ${modalState.pagina.numeroVersion} de ${modalState.pagina.slug}` : ''}
        descripcion={`Devolveremos el borrador a su autor original para que lo corrija.`}
        textoAccion="Rechazar"
        colorAccion="red"
        onConfirmar={confirmarModal}
        onCancelar={() => setModalState({ tipo: null, pagina: null })}
      />

      <ModalAccionConMotivo
        key={`eliminar-${modalState.pagina?.id ?? 'cerrado'}`}
        abierto={modalState.tipo === 'eliminar'}
        titulo={modalState.pagina ? `Eliminar versión ${modalState.pagina.numeroVersion} de ${modalState.pagina.slug}` : ''}
        descripcion="Si eliminas los cambios sin publicar, el trabajo se perderá. Al no haber versiones previas, la página volverá a empezar desde la Versión 1."
        textoAccion="Eliminar"
        colorAccion="red"
        destructivo
        onConfirmar={confirmarModal}
        onCancelar={() => setModalState({ tipo: null, pagina: null })}
      />
    </div>
  );
}

/** Largo máximo del motivo de rechazar o eliminar, el mismo que el comentario del editor. */
const MOTIVO_MAX = 100;

function ModalAccionConMotivo({
  abierto,
  titulo,
  descripcion,
  textoAccion,
  colorAccion = 'red',
  onConfirmar,
  onCancelar,
  requiereMotivo = true,
  destructivo = false,
}: {
  abierto: boolean;
  titulo: string;
  descripcion: string;
  textoAccion: string;
  colorAccion?: 'red' | 'brand';
  onConfirmar: (motivo: string) => void;
  onCancelar: () => void;
  requiereMotivo?: boolean;
  /** La descripción como aviso rojo: para lo que no tiene vuelta atrás. */
  destructivo?: boolean;
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
      // Las medidas de todos los modales (`shared/ui/molecules/alert.tsx`): caja de 32,
      // título de 20 en `#001631`, texto de 16, botones de 44 con esquinas de 32.
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-[32px] border border-zinc-200 bg-white p-0 text-zinc-900 backdrop:bg-[#0f172a]/50 backdrop:backdrop-blur-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:text-[#f6f6f6]"
    >
      <div className="flex flex-col p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-[#001631] dark:text-[#e6e8f0]">
            {titulo}
          </h2>
        </div>

        {destructivo ? (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <p>{descripcion}</p>
          </div>
        ) : (
          <p className="mt-3 text-base text-[#4b5563] dark:text-zinc-300">{descripcion}</p>
        )}

        {requiereMotivo && (
          <div className="mt-4">
            {/* La etiqueta estaba vacía: el campo no tenía nombre para el lector de pantalla. */}
            <label htmlFor="motivo-accion" className="sr-only">
              Motivo
            </label>
            <textarea
              id="motivo-accion"
              rows={3}
              maxLength={MOTIVO_MAX}
              aria-describedby="motivo-accion-cuenta"
              className={`mt-1 block w-full resize-none rounded-xl border bg-transparent px-5 py-3 text-base text-[#001a39] placeholder:text-[#b3b3b3] focus:outline-none focus:ring-2 dark:bg-[#1a233a] dark:text-white ${
                colorAccion === 'red'
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-900/60 dark:focus:border-red-400 dark:focus:ring-red-400'
                  : 'border-[#d9d9d9] focus:border-[#001631] focus:ring-[#001631] dark:border-zinc-700'
              }`}
              placeholder="Explica la razón…"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              autoFocus
            />
            <p
              id="motivo-accion-cuenta"
              className={`mt-2 text-right text-xs tabular-nums ${
                motivo.length >= MOTIVO_MAX ? 'text-red-600 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {motivo.length}/{MOTIVO_MAX}
            </p>
          </div>
        )}

        {/* Los dos botones miden lo mismo (`flex-1`, 44 px de alto): «Cancelar» sin color y
            con borde gris, la acción con el suyo. Apilados en el móvil, la acción arriba. */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancelar}
            className="inline-flex h-11 w-full items-center justify-center rounded-[32px] border border-[#d9d9d9] bg-white px-6 text-base font-medium text-[#001631] hover:bg-[#f5f7fa] focus:outline-none focus:ring-2 focus:ring-[#001631] sm:flex-1 dark:border-zinc-600 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirmar(motivo)}
            disabled={requiereMotivo && !motivo.trim()}
            className={`inline-flex h-11 w-full items-center justify-center rounded-[32px] px-6 text-base font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 ${
              colorAccion === 'red'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#001631] hover:bg-[#002a5c] dark:bg-white dark:text-[#001631] dark:hover:bg-[#e6e8f0]'
            }`}
          >
            {textoAccion}
          </button>
        </div>
      </div>
    </dialog>
  );
}

'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { IconoMascara } from '@/shared/ui/atoms/icono-mascara';
import { BarraFiltros, CampoFiltro } from '@/shared/ui/molecules/barra-filtros';
import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import { DatePicker } from '@/shared/ui/molecules/date-picker';
import { EncabezadoPanel } from '@/shared/ui/molecules/encabezado-panel';
import { CeldaDePagina, FechaDeCelda, fechaDeFila, RESALTE_DE_FILA, ResumenDeFila, useFilasAbiertas } from '@/shared/ui/molecules/fila-acordeon';
import { Paginador } from '@/shared/ui/molecules/paginador';
import { useRevisionQueue } from '../hooks/use-revision-queue';
import type { PaginaEnRevision } from '../../model/pagina.types';
import { rutaPublicaDeSlug } from '../../model/rutas';
import { CargandoSeccion } from '@/shared/ui/molecules/cargando-seccion';
import { GRUPO_TOOLTIP, TOOLTIP_ENCIMA } from '@/shared/ui/atoms/tooltip';
import { COLOR_DE_ACCION } from '@/shared/lib/identidad-panel';
import { AvisoErrorDeCarga } from '@/shared/ui/molecules/aviso-error-de-carga';
import { MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';
import { areaDeModalClass, areaDeModalConErrorClass, ErrorDeCampo } from '@/shared/ui/molecules/alert';

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



/**
 * En la tabla, botones de 36×48 desde 72rem de contenedor (`@6xl`, ~1505px de ventana con
 * la barra lateral) y de 32×44 por debajo: a 1330px los cuatro se veían muy grandes
 * (pedido del usuario, 2026-10-12). Los dos rangos se excluyen (`@6xl` / `@max-6xl`) para
 * no depender del orden en que Tailwind escribe `en-tabla` y `@6xl`. En el acordeón no
 * cambian: llevan el nombre escrito y 44px de alto.
 */
const BOTON =
  `${GRUPO_TOOLTIP} flex h-11 items-center justify-center gap-2 rounded-[16px] border border-transparent px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 en-tabla:px-0 en-tabla:@6xl:h-9 en-tabla:@6xl:w-12 en-tabla:@max-6xl:h-8 en-tabla:@max-6xl:w-11`;

/** El icono de cada botón, a su tamaño de siempre o un paso menos donde el botón se achica. */
const ICONO_OJO = 'h-6 w-6 en-tabla:@max-6xl:h-5 en-tabla:@max-6xl:w-5';
const ICONO_PAPELERA = 'h-5 w-5 en-tabla:@max-6xl:h-4 en-tabla:@max-6xl:w-4';
const ICONO_PEQUENO = 'h-4 w-4 en-tabla:@max-6xl:h-3.5 en-tabla:@max-6xl:w-3.5';

/**
 * El nombre de cada acción, del color de su botón (ver `shared/ui/atoms/tooltip.ts`).
 * Solo con la tabla completa: en tarjetas el botón ya lleva el nombre escrito.
 *
 * Letra blanca, como el icono de su botón: así lo pidió el usuario. No llega al 4,5:1 que
 * pide un texto de 12 px (9-accesibilidad.md §2.1): sobre el azul da 2,6:1, sobre el verde
 * 2,4:1 y sobre el rojo 3,8:1. Con `#0d1526` darían 7,0, 7,5 y 4,7:1.
 */
const TOOLTIP = `${TOOLTIP_ENCIMA} hidden en-tabla:block`;

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
  const { estaAbierta, alternar } = useFilasAbiertas();

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
          {/* «Página» y no «Ámbito» (pedido del usuario, 2026-10-12): la columna del ámbito
              se unió a la de la página. Por dentro sigue filtrando `ambito`. */}
          <CampoFiltro etiqueta="Página">
            <CustomSelect
              ariaLabel="Página"
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
          <table className="olo-tabla-apilable olo-tabla-acordeon w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-[#131b2f]">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Página</th>
                <th scope="col" className="px-4 py-3 font-medium">Cambios</th>
                <th scope="col" className="px-2 py-3 font-medium">Autor</th>
                <th scope="col" className="px-2 py-3 font-medium">Enviado el</th>
                <th scope="col" className="px-2 py-3 font-medium text-right">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {paginasPagina.map((pagina) => {
                const abierta = estaAbierta(pagina.id);                return (
                <tr
                  key={pagina.id}
                  data-abierta={abierta || undefined}
                  className="bg-white dark:bg-[#0f1626] transition-colors hover:bg-zinc-50/60 dark:hover:bg-[#131b2f]/50"
                >
                  {/* Solo en acordeón (en la tabla, `display: none`): la frase de la fila.
                      Plegada, la corta; desplegada, la frase entera en vez de una ficha de
                      datos con etiquetas (pedido del usuario, 2026-10-10: «muy saturada»):
                      «Ana envió la versión 3 de la sección /contacto del sitio web el …».
                      Debajo, el comentario y los botones. */}
                  <td data-resumen>
                    <ResumenDeFila abierta={abierta} onAlternar={() => alternar(pagina.id)}>
                      <span className={RESALTE_DE_FILA}>{pagina.autor?.nombre || 'Alguien'}</span> envió la
                      versión {pagina.numeroVersion} de{' '}
                      {abierta ? (
                        <>
                          la sección <span className={RESALTE_DE_FILA}>{rutaPublicaDeSlug(pagina.slug)}</span> de
                          {pagina.ambito === 'intranet' ? ' la ' : 'l '}
                          <span className={RESALTE_DE_FILA}>{pagina.ambito === 'intranet' ? 'intranet' : 'sitio web'}</span> el{' '}
                          <span className={RESALTE_DE_FILA}>{fechaDeFila(pagina.creadoEn)}</span>
                        </>
                      ) : (
                        <span className={RESALTE_DE_FILA}>{pagina.titulo}</span>
                      )}
                    </ResumenDeFila>
                  </td>
                  {/* Solo en acordeón y desplegada: lo que el editor dice que cambió, sin
                      etiqueta. Se lee antes de decidir, como la descripción de un pull request. */}
                  <td data-detalle>
                    {pagina.comentario && (
                      <p className="mb-3 text-sm italic text-zinc-500 dark:text-zinc-400">«{pagina.comentario}»</p>
                    )}
                  </td>
                  {/* La misma celda que Respaldos y Auditoría (pedido del usuario, 2026-10-15):
                      arriba el ámbito y debajo, pequeño y fino, la ruta con su versión
                      («Sitio web» / «inicio · versión 3»). Antes, el título en negrita. */}
                  <td data-solo-tabla className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    <CeldaDePagina ambito={pagina.ambito} slug={pagina.slug} version={pagina.numeroVersion} />
                  </td>
                  {/* Lo que el editor dice que cambió: se lee antes de decidir, como la
                      descripción de un pull request. */}
                  <td data-solo-tabla data-etiqueta="Cambios" className="px-4 py-3">
                    {pagina.comentario ? (
                      <p className="max-w-md text-sm text-zinc-700 dark:text-zinc-300">«{pagina.comentario}»</p>
                    ) : (
                      <p className="text-sm text-zinc-400">Sin comentario</p>
                    )}
                  </td>
                  <td data-solo-tabla data-etiqueta="Autor" className="px-2 py-3 text-zinc-600 dark:text-zinc-300">
                    <p className="text-sm">{pagina.autor?.nombre || 'Desconocido'}</p>
                    {pagina.autor?.email && (
                      <p className="text-xs text-zinc-400 wrap-anywhere">{pagina.autor.email}</p>
                    )}
                  </td>
                  <td data-solo-tabla data-etiqueta="Enviado el" className="whitespace-nowrap px-2 py-3 text-zinc-600 dark:text-zinc-300">
                    <FechaDeCelda iso={pagina.creadoEn} />
                  </td>
                  <td className="px-2 py-3 text-right">
                    {/* Con la tabla en tarjetas cada botón dice lo que hace, en una rejilla de 2×2: el
                        `title` no aparece en una pantalla táctil y cuatro iconos solos no
                        se distinguen. Con la tabla completa, el texto queda para el lector de pantalla.
                        Tonos 600-700 y no 500: el blanco sobre verde o amarillo 500 no llega
                        al 3:1 ni para un icono. */}
                    <div className="grid grid-cols-2 gap-2 en-tabla:flex en-tabla:items-center en-tabla:justify-end">
                      <a
                        href={enlaceDeVistaPrevia(pagina)}
                        className={`group ${BOTON} bg-[#1FACE3] text-white hover:brightness-95 focus:ring-[#1FACE3]/50`}
                      >
                        <span className={`relative inline-block ${ICONO_OJO}`}>
                          <span className="absolute inset-0 flex items-center justify-center group-hover:hidden group-focus-visible:hidden"><IconoMascara nombre="eye-closed" tamano={ICONO_OJO} /></span>
                          <span className="absolute inset-0 hidden items-center justify-center group-hover:flex group-focus-visible:flex"><IconoMascara nombre="eye-open" tamano={ICONO_OJO} /></span>
                        </span>
                        <span className="en-tabla:sr-only">Visualizar</span>
                        <span aria-hidden="true" className={`${TOOLTIP} ${COLOR_DE_ACCION.visualizar}`}>Visualizar</span>
                      </a>
                      <button
                        type="button"
                        disabled={busySlug === pagina.slug}
                        onClick={() => abrirAprobar(pagina)}
                        className={`${BOTON} bg-[#7DB728] text-white hover:brightness-95 focus:ring-[#7DB728]/50 disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <IconoMascara nombre="send" tamano={ICONO_PEQUENO} />
                        <span className="en-tabla:sr-only">Publicar</span>
                        <span aria-hidden="true" className={`${TOOLTIP} ${COLOR_DE_ACCION.aprobar}`}>Publicar</span>
                      </button>
                      <button
                        type="button"
                        disabled={busySlug === pagina.slug}
                        onClick={() => abrirRechazar(pagina)}
                        className={`${BOTON} border-[#FF1F1F] bg-[#FFE9E9] text-[#FF1F1F] hover:brightness-95 focus:ring-[#FF1F1F]/50 disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <IconoMascara nombre="equiz" tamano={ICONO_PEQUENO} />
                        <span className="en-tabla:sr-only">Rechazar</span>
                        {/* `#d11a1a` y no el `#FF1F1F` del icono: sobre el rosa da 4,7:1; el del icono, 3,3:1. */}
                        <span aria-hidden="true" className={`${TOOLTIP} ${COLOR_DE_ACCION.rechazar}`}>Rechazar</span>
                      </button>
                      <button
                        type="button"
                        disabled={busySlug === pagina.slug}
                        onClick={() => abrirEliminar(pagina)}
                        className={`${BOTON} bg-[#FF1F1F] text-white hover:brightness-95 focus:ring-[#FF1F1F]/50 disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <IconoMascara nombre="trash" tamano={ICONO_PAPELERA} />
                        <span className="en-tabla:sr-only">Eliminar</span>
                        <span aria-hidden="true" className={`${TOOLTIP} ${COLOR_DE_ACCION.eliminar}`}>Eliminar</span>
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
        colorAccion="green"
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
  colorAccion?: 'red' | 'brand' | 'green';
  onConfirmar: (motivo: string) => void;
  onCancelar: () => void;
  requiereMotivo?: boolean;
  /** La descripción como aviso rojo: para lo que no tiene vuelta atrás. */
  destructivo?: boolean;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [motivo, setMotivo] = useState('');
  // Se marca al pulsar la acción sin motivo y se quita en cuanto se escribe. Antes el
  // botón se quedaba apagado sin decir por qué; ahora se puede pulsar y el campo dice
  // lo que falta.
  const [faltaMotivo, setFaltaMotivo] = useState(false);

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
      className="olo-anim-dialogo m-auto w-[calc(100%-2rem)] max-w-md rounded-[32px] border border-zinc-200 bg-white p-0 text-zinc-900 backdrop:bg-[#0f172a]/50 backdrop:backdrop-blur-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:text-[#f6f6f6]"
    >
      <div className="flex flex-col p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-[#001631] dark:text-[#e6e8f0]">
            {titulo}
          </h2>
        </div>

        {destructivo ? (
          <MensajeEstado tipo="error" rol="note" className="mt-3">
            {descripcion}
          </MensajeEstado>
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
              aria-invalid={faltaMotivo || undefined}
              aria-describedby={faltaMotivo ? 'motivo-accion-error motivo-accion-cuenta' : 'motivo-accion-cuenta'}
              className={`mt-1 block resize-none ${faltaMotivo ? areaDeModalConErrorClass : areaDeModalClass}`}
              placeholder="Explica la razón…"
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setFaltaMotivo(false);
              }}
              autoFocus
            />
            {faltaMotivo && <ErrorDeCampo id="motivo-accion-error">Falta el motivo.</ErrorDeCampo>}
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
            onClick={() => {
              if (requiereMotivo && !motivo.trim()) {
                setFaltaMotivo(true);
                return;
              }
              onConfirmar(motivo);
            }}
            className={`inline-flex h-11 w-full items-center justify-center rounded-[32px] px-6 text-base font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 ${
              colorAccion === 'red'
                ? 'bg-red-600 hover:bg-red-700'
                : colorAccion === 'green'
                ? 'bg-[#7DB728] hover:bg-[#6da020]'
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

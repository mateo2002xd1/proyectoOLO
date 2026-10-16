'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { rutaPublicaDeSlug, type PaginaPublicada, type ResumenPaginasPublicadas } from '@/features/paginas';
import type { TreeSeriesOption } from 'echarts/charts';
import { GraficoEcharts, useEsOscuro, type OpcionGrafico } from '@/shared/ui/molecules/grafico-echarts';
import { poppins } from '@/shared/lib/fonts';

/**
 * Cuántas páginas están publicadas, separadas por aplicación y con el detalle a un clic.
 *
 * Antes la tarjeta «Páginas» del panel mostraba un `0` fijo escrito en el código: no
 * consultaba nada. Ahora sale de `GET /api/paginas/publicadas`, que es la única fuente
 * que sabe qué está publicado de verdad (`versionPublicadaId`).
 *
 * Se separa sitio e intranet porque son dos portales distintos con el mismo slug: las
 * dos tienen `/inicio` y `/menu-y-pie`, y un total conjunto no diría a cuál pertenece
 * cada una ni permitiría enlazarlas bien.
 *
 * El desplegable es un árbol de ECharts (pedido del usuario, 2026-10-10): «Sitio web» e
 * «Intranet» son dos ramas que se abren al tocarlas, y cada página, una hoja que lleva a
 * ella como antes el enlace. Un lienzo no se recorre con el teclado ni lo lee un lector
 * de pantalla, así que la lista de enlaces de siempre sigue en el HTML, oculta, y aparece
 * en cuanto se llega a ella con el tabulador.
 */

/** La URL del portal de la intranet, que corre en otro origen. */
const URL_INTRANET = process.env.NEXT_PUBLIC_INTRANET_URL || 'http://localhost:3001';

type Ambito = 'sitio' | 'intranet';

/** La dirección de cada página. La intranet vive en otro origen: lleva su URL completa. */
const hrefDe = (pagina: PaginaPublicada, externo: boolean) =>
  externo ? `${URL_INTRANET}${rutaPublicaDeSlug(pagina.slug)}` : rutaPublicaDeSlug(pagina.slug);

/** Los títulos los escriben los editores y el tooltip de ECharts es HTML: se escapan. */
const escaparHtml = (texto: string) =>
  texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Flecha de la sección plegable. Gira en vez de cambiar de icono: un solo elemento que animar. */
function Chevron({ abierto }: { abierto: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`size-3 shrink-0 transition-transform duration-200 ${abierto ? 'rotate-90' : ''}`}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

interface GrupoProps {
  etiqueta: string;
  paginas: PaginaPublicada[];
  externo: boolean;
}

/**
 * Las páginas se abren en otra pestaña, también las del sitio (pedido del usuario,
 * 2026-10-10): quien está en el dashboard consulta una página y vuelve sin perderlo.
 * `noopener` porque sin él la página destino recibe `window.opener` y puede redirigir esta.
 */
const abrirEnOtraPestana = (href: string) => window.open(href, '_blank', 'noopener,noreferrer');

/** La lista de enlaces de un ámbito: lo que usan el teclado y el lector de pantalla. */
function Grupo({ etiqueta, paginas, externo }: GrupoProps) {
  const [abierto, setAbierto] = useState(false);
  const idLista = useId();
  const vacio = paginas.length === 0;

  return (
    <li>
      {/* `aria-expanded` + `aria-controls` es lo que convierte un botón en un desplegable
          para quien navega con lector de pantalla; sin eso solo se oiría «botón». */}
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        disabled={vacio}
        aria-expanded={abierto}
        aria-controls={idLista}
        className="flex w-full items-center justify-between gap-2 rounded py-1 text-left text-xs transition-colors hover:text-zinc-900 disabled:cursor-default disabled:opacity-60 dark:hover:text-white"
      >
        <span className="flex min-w-0 items-center gap-1.5 text-zinc-500 dark:text-[#94a3b8]">
          {!vacio && <Chevron abierto={abierto} />}
          {/* Sin páginas no hay flecha; el hueco la mantiene alineada con el grupo de al lado. */}
          {vacio && <span aria-hidden="true" className="size-3 shrink-0" />}
          <span className="truncate">{etiqueta}</span>
        </span>
        <span className="font-semibold tabular-nums text-zinc-700 dark:text-[#cbd5e1]">
          {paginas.length}
        </span>
      </button>

      {abierto && !vacio && (
        <ul id={idLista} className="mb-1 ml-[0.34rem] space-y-0.5 border-l border-zinc-200 pl-3 dark:border-[#7db828]/25">
          {paginas.map((pagina) => {
            const href = hrefDe(pagina, externo);
            const clases =
              'block truncate rounded py-0.5 text-xs text-[#4C7A1C] transition-colors hover:underline dark:text-[#9ED65C]';

            return (
              <li key={pagina.id}>
                {/* En otra pestaña, como en el árbol (`abrirEnOtraPestana`). */}
                <a href={href} target="_blank" rel="noopener noreferrer" className={clases} title={pagina.titulo}>
                  {pagina.titulo}
                  <span className="sr-only"> (se abre en otra pestaña)</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

/** Alto de cada página desplegada: el área táctil de una hoja del árbol. */
const ALTO_HOJA = 30;
/** Alto de una rama plegada (o sin páginas). */
const ALTO_RAMA = 40;
/**
 * Hueco a la derecha de las hojas para su título: lo que deja la zona de las píldoras,
 * entre un mínimo y un máximo. En una tarjeta ancha el título cabe entero y la línea hasta
 * las páginas no se alarga sin necesidad; en una estrecha se corta con «…».
 */
const ANCHO_TITULO = { minimo: 90, maximo: 260 };
/** Tramo recto antes de cada página, desde la línea vertical de la escalera. */
const TRAMO_FINAL = 16;
/** Aire entre el final de la píldora más ancha y la línea vertical. */
const AIRE_TRAS_PILDORA = 12;
/** La letra del panel para el lienzo, que no hereda la de la página. */
const LETRA = poppins.style.fontFamily;

let medidor: CanvasRenderingContext2D | null | undefined;
/** Ancho de un texto con la letra dada, medido como lo pinta el lienzo. */
function anchoDeTexto(texto: string, fuente: string): number {
  if (typeof document === 'undefined') return texto.length * 7;
  medidor ??= document.createElement('canvas').getContext('2d');
  if (!medidor) return texto.length * 7;
  medidor.font = fuente;
  return medidor.measureText(texto).width;
}

/** El texto de la píldora: nombre, número y flecha, en trozos de texto enriquecido. */
const flechaDe = (vacia: boolean, abierta: boolean) => (vacia ? '' : abierta ? '  ▾' : '  ▸');

/** Lo que ocupa la píldora de una rama: su texto y 12 px de relleno a cada lado. */
const anchoDePildora = (etiqueta: string, total: number, flecha: string) =>
  anchoDeTexto(etiqueta, `500 12px ${LETRA}`) +
  anchoDeTexto('  ', `400 12px ${LETRA}`) +
  anchoDeTexto(String(total), `700 12px ${LETRA}`) +
  anchoDeTexto(flecha, `400 11px ${LETRA}`) +
  24;

/** Lo que cuelga de cada nodo del árbol, para saber qué hacer al tocarlo. */
type DatosDeNodo = { ambito?: Ambito; href?: string; ruta?: string };

/**
 * Un nodo del árbol con esos campos propios: ECharts los guarda y los devuelve en el clic
 * (`datos`), aunque su tipo no los conoce.
 */
type Nodo = NonNullable<TreeSeriesOption['data']>[number] & DatosDeNodo & { children?: Nodo[] };

/**
 * Los colores de cada rama, los mismos de «Visitas»: verde el sitio, azul la intranet. El
 * fondo de la píldora es opaco (en oscuro, el tono ya mezclado con el de la tarjeta,
 * `#131b2f`): las líneas arrancan debajo y con transparencia se veían a través del texto.
 */
function coloresDe(ambito: Ambito, oscuro: boolean) {
  if (ambito === 'sitio') {
    return oscuro
      ? { fondo: '#24342e', texto: '#9ED65C', linea: 'rgba(158,214,92,0.45)' }
      : { fondo: '#eef6e3', texto: '#3f6a14', linea: 'rgba(76,122,28,0.35)' };
  }
  return oscuro
    ? { fondo: '#10304d', texto: '#7dd3fc', linea: 'rgba(125,211,252,0.4)' }
    : { fondo: '#e0f2fe', texto: '#0369a1', linea: 'rgba(2,132,199,0.3)' };
}

/** Las dos ramas en un árbol de ECharts. Tocar una rama la abre o la cierra; una hoja, abre su página. */
function ArbolDePaginas({ resumen }: { resumen: ResumenPaginasPublicadas | null }) {
  const oscuro = useEsOscuro();
  const [abiertas, setAbiertas] = useState<ReadonlySet<Ambito>>(() => new Set());
  // El ancho del árbol: la línea vertical de la escalera va justo antes de las páginas, a
  // `TRAMO_FINAL` px, y ECharts solo la sitúa en porcentaje de la distancia rama-página.
  const cajaRef = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(0);
  useEffect(() => {
    const caja = cajaRef.current;
    if (!caja) return;
    const observador = new ResizeObserver(([entrada]) => setAncho(Math.round(entrada.contentRect.width)));
    observador.observe(caja);
    return () => observador.disconnect();
  }, []);
  // No se pinta hasta tener Poppins en los pesos que usa. ECharts guarda el ancho de cada
  // texto en una caché propia la primera vez que lo mide: medido con la letra de reserva,
  // el número de la píldora quedaba montado sobre el nombre aunque luego se repintara.
  const [letraLista, setLetraLista] = useState(false);
  useEffect(() => {
    let vigente = true;
    const pesos = [400, 500, 700].map((peso) => document.fonts?.load(`${peso} 12px ${LETRA}`));
    // Si no carga (sin red, navegador sin la API), se pinta igual con la de reserva.
    Promise.allSettled(pesos).then(() => {
      if (vigente) setLetraLista(true);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const { opcion, alto } = useMemo(() => {
    const ramas = [
      { ambito: 'sitio' as const, etiqueta: 'Sitio web', paginas: resumen?.sitio ?? [], externo: false },
      { ambito: 'intranet' as const, etiqueta: 'Intranet', paginas: resumen?.intranet ?? [], externo: true },
    ];
    let arriba = 4;
    const series: TreeSeriesOption[] = [];
    // La línea vertical va después de la píldora más ancha («Sitio web 10» mide más que
    // «Sitio web 5»): con un hueco fijo, en una tarjeta estrecha la línea la cruzaba.
    const pildoraMasAncha = Math.max(
      ...ramas.map((rama) => anchoDePildora(rama.etiqueta, rama.paginas.length, flechaDe(rama.paginas.length === 0, true))),
    );
    const zonaDeRamas = 2 + pildoraMasAncha + AIRE_TRAS_PILDORA + TRAMO_FINAL;
    const anchoTitulo = Math.round(Math.min(ANCHO_TITULO.maximo, Math.max(ANCHO_TITULO.minimo, ancho - zonaDeRamas)));
    // Distancia de la rama (x = 2) a las páginas (x = ancho − anchoTitulo); sin medir aún, 85 %.
    const recorrido = ancho - 2 - anchoTitulo;
    const horquilla = recorrido > TRAMO_FINAL * 2 ? `${Math.round(100 * (1 - TRAMO_FINAL / recorrido))}%` : '85%';

    for (const rama of ramas) {
      const abierta = abiertas.has(rama.ambito) && rama.paginas.length > 0;
      const altoRama = abierta ? Math.max(ALTO_RAMA, rama.paginas.length * ALTO_HOJA) : ALTO_RAMA;
      const color = coloresDe(rama.ambito, oscuro);
      const vacia = rama.paginas.length === 0;
      const flecha = flechaDe(vacia, abierta);
      const raiz: Nodo = {
        name: rama.etiqueta,
        ambito: rama.ambito,
        collapsed: !abierta,
        // La rama: una píldora con el nombre y el número, encima del arranque de sus
        // líneas. En el nodo y no en la serie: lo de la serie lo heredan las hojas.
        symbol: 'none',
        label: {
          position: 'right',
          distance: 0,
          formatter: `{nombre|${rama.etiqueta}}  {total|${rama.paginas.length}}{flecha|${flecha}}`,
          backgroundColor: vacia ? (oscuro ? '#222b3f' : '#f4f4f5') : color.fondo,
          borderRadius: 999,
          padding: [6, 12],
          // Cada trozo con su letra: sin ella, ECharts los mide con la de serie y los pinta
          // con Poppins, y el número se montaba sobre el nombre.
          rich: {
            nombre: { fontFamily: LETRA, fontSize: 12, fontWeight: 500, color: vacia ? '#a1a1aa' : color.texto },
            total: { fontFamily: LETRA, fontSize: 12, fontWeight: 700, color: vacia ? '#a1a1aa' : color.texto },
            flecha: { fontFamily: LETRA, fontSize: 11, color: color.texto },
          },
        },
        children: rama.paginas.map((pagina) => ({
          name: pagina.titulo,
          href: hrefDe(pagina, rama.externo),
          ruta: rutaPublicaDeSlug(pagina.slug),
          symbolSize: 7,
          // En cada hoja y no en la serie: la rama lo heredaba y su píldora salía con este
          // ancho fijo y el número montado sobre el nombre.
          label: { width: anchoTitulo - 10, overflow: 'truncate' },
        })),
      };

      series.push({
        type: 'tree',
        orient: 'LR',
        top: arriba,
        height: altoRama,
        left: 2,
        right: anchoTitulo,
        // Sin zoom ni arrastre: es un desplegable, no un mapa que explorar.
        roam: false,
        // La mano solo donde tocar hace algo: una rama sin páginas no se abre.
        cursor: vacia ? 'default' : 'pointer',
        // Lo abre y lo cierra este componente (`collapsed`), no ECharts: así el alto del
        // gráfico crece con lo desplegado y el toque en una hoja navega.
        expandAndCollapse: false,
        // Líneas rectas en escalera, como las carpetas de un explorador (el usuario vio
        // difíciles de seguir las curvas, 2026-10-10).
        edgeShape: 'polyline',
        edgeForkPosition: horquilla,
        lineStyle: { color: color.linea, width: 1.5 },
        // Corta: cada vez que se abre o se cierra una rama el gráfico se monta de nuevo.
        animationDuration: 350,
        animationDurationUpdate: 350,
        // Las páginas: un punto y su título, que se corta si no cabe (el completo, en el tooltip).
        symbol: 'circle',
        itemStyle: { color: color.texto, borderWidth: 0 },
        label: {
          position: 'right',
          distance: 6,
          fontSize: 12,
          color: color.texto,
        },
        emphasis: { focus: 'none', label: { fontWeight: 700 } },
        data: [raiz],
      });
      arriba += altoRama + 4;
    }

    const opcion: OpcionGrafico = {
      // El lienzo no hereda la letra de la página: se le dice cuál (la del panel).
      textStyle: { fontFamily: LETRA },
      tooltip: {
        trigger: 'item',
        confine: true,
        backgroundColor: oscuro ? '#1e293b' : '#ffffff',
        borderColor: oscuro ? '#334155' : '#e4e4e7',
        textStyle: { color: oscuro ? '#f6f6f6' : '#18181b', fontSize: 12 },
        // Solo las hojas: el título entero (en la hoja se corta) y su ruta. En la rama no
        // hay nada que añadir a la píldora, y un texto vacío no abre el tooltip.
        formatter: (parametros) => {
          const nodo = (Array.isArray(parametros) ? parametros[0] : parametros).data as Nodo | undefined;
          if (!nodo?.href) return '';
          return (
            `<strong>${escaparHtml(String(nodo.name))}</strong><br/>${escaparHtml(nodo.ruta ?? '')}` +
            '<br/><span style="opacity:.7">Se abre en otra pestaña</span>'
          );
        },
        extraCssText: 'max-width:16rem;white-space:normal;',
      },
      series,
    };
    return { opcion, alto: arriba };
  }, [resumen, abiertas, oscuro, ancho]);

  const alTocar = (_indice: number, { datos }: { serie: number; datos: unknown }) => {
    const nodo = datos as DatosDeNodo | undefined;
    if (nodo?.href) {
      abrirEnOtraPestana(nodo.href);
      return;
    }
    const ambito = nodo?.ambito;
    if (!ambito) return;
    setAbiertas((previas) => {
      const nuevas = new Set(previas);
      if (nuevas.has(ambito)) nuevas.delete(ambito);
      else nuevas.add(ambito);
      return nuevas;
    });
  };

  // Mientras llega la letra, el hueco del árbol plegado: la tarjeta no salta al aparecer.
  return (
    <div ref={cajaRef}>
      {letraLista ? (
        // Un gráfico nuevo cada vez que se abre o se cierra una rama: al plegar, ECharts no
        // borra las líneas en escalera de las páginas que se van y se quedaban dibujadas.
        <GraficoEcharts
          key={[...abiertas].sort().join('|') || 'plegado'}
          option={opcion}
          alto={alto}
          onClickElemento={alTocar}
        />
      ) : (
        <div style={{ height: alto }} />
      )}
    </div>
  );
}

interface Props {
  resumen: ResumenPaginasPublicadas | null;
  error: string | null;
}

export function TarjetaPaginasPublicadas({ resumen, error }: Props) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155]">
      <p className="text-sm text-[#001631] dark:text-[#94a3b8]">Páginas publicadas</p>

      {error ? (
        // Un guion, no un cero: cero es un dato y aquí no se pudo leer ninguno.
        <>
          <p className="mt-1 text-2xl font-bold text-zinc-400 dark:text-zinc-600">—</p>
          <p className="mt-2 text-xs text-red-600 dark:text-red-300">{error}</p>
        </>
      ) : (
        <>
          <p className="mt-1 text-2xl font-bold text-[#001631] dark:text-[#f6f6f6]">
            {resumen?.total ?? 0}
          </p>

          <div className="mt-3 border-t border-zinc-100 pt-2 dark:border-[#7db828]/20">
            {/* El árbol es para la vista y el toque; el lector de pantalla y el teclado
                usan la lista de abajo, que dice lo mismo con enlaces de verdad y se ve en
                cuanto el foco entra en ella. `not-focus-within:sr-only` y no
                `sr-only focus-within:not-sr-only`: el `.sr-only` sin capa de globals.css
                le gana a cualquier utilidad y la lista no aparecía nunca. */}
            <div aria-hidden="true">
              <ArbolDePaginas resumen={resumen} />
            </div>
            <ul aria-label="Páginas publicadas por portal" className="not-focus-within:sr-only">
              <Grupo etiqueta="Sitio web" paginas={resumen?.sitio ?? []} externo={false} />
              <Grupo etiqueta="Intranet" paginas={resumen?.intranet ?? []} externo />
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

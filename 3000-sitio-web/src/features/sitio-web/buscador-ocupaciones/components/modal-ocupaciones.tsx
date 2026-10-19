'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { useCierreAnimado, useUltimoValorAbierto } from '@/shared/lib/use-cierre-animado';

interface ModalOcupacionesProps {
  abierto: boolean;
  onCerrar: () => void;
  /** Rótulo pequeño sobre el título: "Resultados de la búsqueda", "Ocupación", … */
  antetitulo?: string;
  titulo: ReactNode;
  /**
   * Identifica el contenido que se está mostrando. Al cambiar, el foco vuelve al
   * panel: quien pasa de los resultados al detalle lo hace pulsando una fila
   * que en ese mismo instante se desmonta, y sin esto el foco cae al `<body>` y
   * el diálogo deja de responder al tabulador y a Escape.
   */
  claveContenido?: string;
  /** Acción secundaria en el pie (por ejemplo, volver a los resultados). */
  pie?: ReactNode;
  /**
   * Color del encabezado y de las etiquetas de código del contenido. Vacío = #001631.
   * El buscador de la portada pasa el color de su recuadro, para que el modal haga juego.
   */
  colorAcento?: string;
  /**
   * Ocupa toda la ventana, sin esquinas ni márgenes, y sigue siendo un diálogo modal
   * (foco encerrado, Escape, fondo bloqueado). El contenido se centra a 1200 px para
   * que en pantallas anchas las líneas no se estiren. Lo usa el buscador de la portada.
   */
  pantallaCompleta?: boolean;
  children: ReactNode;
}

/**
 * "¿Ya estoy en el navegador?", en la forma que React tiene prevista para
 * preguntarlo: el valor del servidor es `false` y el del cliente `true`, y no
 * cambia nunca más, así que no hay a qué suscribirse.
 *
 * Es la alternativa a un `useState(false)` + `useEffect(() => setMontado(true))`,
 * que además de provocar un render en cascada está prohibido por la regla
 * `react-hooks/set-state-in-effect` de este proyecto.
 */
const sinSuscripcion = () => () => {};
const enCliente = () => true;
const enServidor = () => false;

/** Elementos que pueden recibir el foco dentro del panel, para el ciclo con Tab. */
const SELECTOR_ENFOCABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/**
 * Contenedor común de las dos vistas del buscador: panel centrado sobre el azul
 * institucional, esquinas de 16px y encabezado en `#001631`, el mismo azul y el
 * mismo radio que el banner de búsqueda.
 *
 * Implementa lo que el patrón WAI-ARIA de diálogo modal exige y que un `div`
 * suelto no da: cierre con Escape, foco encerrado dentro del panel mientras
 * está abierto, devolución del foco al elemento que lo abrió, y bloqueo del
 * desplazamiento de la página de fondo.
 *
 * Se pinta con `createPortal` colgando de `<body>` y no donde está escrito, por
 * dos razones que se suman:
 *
 * 1. La cabecera del sitio (`.olo-header`) es `sticky` con `z-index: 1000`. Un
 *    `z-50` de Tailwind son 50: el diálogo quedaba por debajo y la cabecera lo
 *    recortaba por arriba. De ahí el `z-[2000]`, la misma capa que ya usa
 *    `.olo-search-modal` para ponerse sobre la cabecera.
 * 2. El diálogo se escribe dentro de `<main>`, y ahí cualquier antepasado con
 *    `transform`, `filter` u `opacity < 1` se convierte en el marco de
 *    referencia de sus descendientes `fixed` y los encierra en su apilamiento.
 *    Ya pasó en este sitio con el botón «Editar sección» y
 *    `.olo-route-transition` —está contado en `globals.css`—, así que sacarlo
 *    del árbol de la página es lo que impide que vuelva a pasar.
 */
export function ModalOcupaciones({
  abierto,
  onCerrar,
  antetitulo: antetituloAbierto,
  titulo: tituloAbierto,
  claveContenido,
  pie: pieAbierto,
  colorAcento,
  pantallaCompleta = false,
  children: contenidoAbierto,
}: ModalOcupacionesProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const focoPrevioRef = useRef<HTMLElement | null>(null);

  /** `document` no existe al renderizar en el servidor; el portal solo puede montarse en el cliente. */
  const montado = useSyncExternalStore(sinSuscripcion, enCliente, enServidor);

  // Bloquear el scroll del fondo. Se guarda el valor previo en vez de asumir
  // que era vacío: con las dos vistas encadenadas hay un momento en que ambas
  // están montadas y la segunda no debe borrar el bloqueo de la primera.
  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo || '';
    };
  }, [abierto]);

  // Recordar quién tenía el foco antes de abrir y devolvérselo al cerrar. Va en
  // su propio efecto, atado solo a `abierto`: si dependiera también del
  // contenido, cada cambio de vista guardaría como "foco previo" un elemento
  // del propio diálogo, que para entonces ya no existe.
  useEffect(() => {
    if (!abierto) return;

    focoPrevioRef.current = document.activeElement as HTMLElement | null;
    return () => {
      focoPrevioRef.current?.focus?.();
    };
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    const temporizador = setTimeout(() => panelRef.current?.focus(), 0);
    return () => clearTimeout(temporizador);
  }, [abierto, claveContenido]);

  const alPulsarTecla = useCallback(
    (evento: KeyboardEvent<HTMLDivElement>) => {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        onCerrar();
        return;
      }

      if (evento.key !== 'Tab') return;

      const enfocables = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(SELECTOR_ENFOCABLES) ?? [],
      ).filter((elemento) => elemento.offsetParent !== null);

      if (enfocables.length === 0) return;

      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      const activo = document.activeElement;

      if (evento.shiftKey && (activo === primero || activo === panelRef.current)) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && activo === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    },
    [onCerrar],
  );

  // Mientras se va, lo último que enseñó abierto: el padre vacía lo que pinta al cerrar
  // (en Alertas de inversión, el proyecto vuelve a `null`).
  const { montado: presente, cerrando } = useCierreAnimado(abierto);
  const antetitulo = useUltimoValorAbierto(abierto, antetituloAbierto);
  const titulo = useUltimoValorAbierto(abierto, tituloAbierto);
  const pie = useUltimoValorAbierto(abierto, pieAbierto);
  const children = useUltimoValorAbierto(abierto, contenidoAbierto);

  if (!presente || !montado) return null;

  /** Ancho del contenido del encabezado, el cuerpo y el pie a pantalla completa. */
  const ancho = pantallaCompleta ? 'mx-auto w-full max-w-[1200px]' : '';

  return createPortal(
    <div
      className={`olo-anim-fondo fixed inset-0 z-[2000] flex items-center justify-center overflow-y-auto bg-[#001631]/80 backdrop-blur-sm ${pantallaCompleta ? '' : 'p-4 sm:p-6'}`}
      data-cerrando={cerrando || undefined}
      // En una variable y no en cada pieza: las etiquetas de código las pintan
      // `ResultadosOcupaciones` y `DetalleOcupacion`, que no reciben el color.
      style={colorAcento ? ({ '--olo-modal-acento': colorAcento } as CSSProperties) : undefined}
      onMouseDown={(evento) => {
        // `onMouseDown` y no `onClick`: al seleccionar texto dentro del panel y
        // soltar el ratón fuera, el clic se contabiliza en el fondo y el panel
        // se cerraba en mitad de la selección.
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-ocupaciones-titulo"
        tabIndex={-1}
        onKeyDown={alPulsarTecla}
        /* Tres cuartos de ancho y cuatro quintos de alto de la ventana, pero solo
           a partir de `sm`: en un móvil el 75% dejaría la tabla de resultados en
           una columna inservible, así que ahí ocupa todo lo que el relleno del
           fondo le deja. El alto es un *máximo*, no una altura fija —una búsqueda
           con dos resultados no tiene por qué pintar un panel medio vacío—, y en
           `dvh` para que la barra del navegador móvil no lo desborde. */
        className={`olo-anim-caja flex w-full flex-col overflow-hidden bg-white shadow-2xl outline-none ${
          pantallaCompleta
            ? 'h-dvh'
            : 'max-h-[calc(100dvh-2rem)] rounded-[16px] sm:max-h-[80dvh] sm:w-[75vw]'
        }`}
      >
        <header className="bg-[var(--olo-modal-acento,#001631)] px-5 py-4 text-white sm:px-7 sm:py-5">
          <div className={`flex items-start gap-4 ${ancho}`}>
            <div className="min-w-0 flex-1">
              {antetitulo && (
                <p className="text-[11px] tracking-[0.14em] text-white/60 uppercase">
                  {antetitulo}
                </p>
              )}
              <h2
                id="modal-ocupaciones-titulo"
                className="mt-1 text-base leading-snug text-balance sm:text-lg"
              >
                {titulo}
              </h2>
            </div>

            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              className="-mr-1 shrink-0 cursor-pointer rounded-[10px] p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7DB828]"
            >
              <XMarkIcon className="size-5" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className={ancho}>{children}</div>
        </div>

        {pie && (
          <footer className="border-t border-[#eaecf0] bg-[#f8f9fa] px-5 py-3 sm:px-7">
            <div className={`flex flex-wrap items-center justify-between gap-3 ${ancho}`}>{pie}</div>
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}

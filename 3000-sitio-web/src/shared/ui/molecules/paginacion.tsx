'use client';

import { FormEvent, useId, useState } from 'react';
import { CustomSelect } from './custom-select';

/**
 * De qué zona es la paginación:
 *   - `panel`: el diseño sin bordes del mockup del usuario (2026-10-20): «Anterior» y
 *     «Siguiente» en gris, los números en `#001631` y en negrita, la página actual
 *     sobre una casilla gris redondeada, y solo la primera, la actual y la última página
 *     con `…` entre medias (`1 … 90`). Ver `GrupoDelPanel`;
 *   - `publico`: el grupo de casillas unidas con borde, con los grises de las tablas
 *     del sitio (`#344054`, `#d0d5dd`) y la página actual en `#001631`. El sitio
 *     público no tiene tema oscuro.
 *
 * «Ir a la página» y «Filas por página» son iguales en las dos zonas; solo cambia la
 * paleta.
 */
type Tono = 'panel' | 'publico';

interface PaginacionProps {
  /** Página actual, en base 1. */
  pagina: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
  tono: Tono;
  /** Nombre de la navegación para lectores de pantalla. */
  ariaLabel?: string;
  /** Si llega, «Filas por página» va al final, después de «Ir a la página». */
  porPagina?: FilasPorPaginaProps;
  className?: string;
}

interface FilasPorPaginaProps {
  valor: number;
  opciones: readonly number[];
  onCambiar: (porPagina: number) => void;
}

const COLORES: Record<
  Tono,
  { boton: string; actual: string; hueco: string; deshabilitado: string; texto: string; campo: string }
> = {
  panel: {
    boton:
      'border-zinc-300 bg-white text-zinc-500 shadow-xs hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-[#131b2f] dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white',
    actual: 'border-[#001631] bg-[#001631] text-white dark:border-white dark:bg-white dark:text-[#001631]',
    hueco: 'border-zinc-300 bg-white text-zinc-400 shadow-xs dark:border-zinc-700 dark:bg-[#131b2f]',
    deshabilitado: 'disabled:text-zinc-300 dark:disabled:text-zinc-600',
    texto: 'text-zinc-500 dark:text-[#94a3b8]',
    campo:
      'border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-[#131b2f] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-white dark:focus:ring-white',
  },
  publico: {
    boton: 'border-[#d0d5dd] bg-white text-[#344054] shadow-xs hover:bg-[#f2f4f7] hover:text-[#001631]',
    actual: 'border-[#001631] bg-[#001631] text-white',
    hueco: 'border-[#d0d5dd] bg-white text-[#98a2b3] shadow-xs',
    deshabilitado: 'disabled:text-[#d0d5dd]',
    texto: 'text-[#344054]',
    campo:
      'border-[#d0d5dd] bg-white text-[#001631] placeholder:text-[#98a2b3] focus:border-[#001631] focus:ring-[#001631]',
  },
};

/**
 * Forma común de cada casilla del grupo.
 *
 * El ejemplo del que sale el diseño quita el foco (`focus:outline-none`) y no pone
 * nada en su lugar. Aquí se cambia por el anillo de marca, que cumple el 3:1 de
 * SC 1.4.11 (`9-accesibilidad.md`): sin él, quien navega con teclado no sabe en qué
 * página está parado. `z-10` lo sube por encima de las vecinas, que con
 * `-space-x-px` se montan un píxel sobre cada borde y lo taparían.
 *
 * 32px en móvil y 36px desde `sm`: con siete posiciones y las dos flechas la fila
 * cabe en un teléfono de 375px. Todo el pie usa esa misma altura, las mismas esquinas
 * (`rounded-lg`) y la misma letra (14 px, medium): casillas, «Ir a la página» y «Filas
 * por página» (pedido del usuario, 2026-10-10: simetría de tamaños y bordes).
 */
const CASILLA =
  'flex h-8 items-center justify-center border text-sm font-medium leading-5 tabular-nums transition-colors focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus sm:h-9';
const NUMERO = 'w-8 sm:w-9';
/** Las dos flechas, del mismo ancho: «Anterior» y «Siguiente» no miden lo mismo y el grupo quedaba torcido. */
const FLECHA = 'w-8 gap-1 disabled:pointer-events-none disabled:shadow-none sm:w-[5.5rem]';
/** El campo de «Ir a la página» y el desplegable de «Filas por página», del mismo ancho. */
const ANCHO_DE_CAMPO = 'w-[4.5rem]';

function ChevronIcon({ direccion }: { direccion: 'izquierda' | 'derecha' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 sm:hidden">
      <path
        d={direccion === 'izquierda' ? 'm12.5 15-5-5 5-5' : 'm7.5 5 5 5-5 5'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Posiciones entre las dos flechas, contando los `…`. */
const POSICIONES = 7;

type Posicion = number | '…';

/**
 * Qué números mostrar: siempre la primera y la última página, la actual con sus
 * vecinas, y `…` en los huecos.
 *
 * Siempre son exactamente `POSICIONES`, estés en la página que estés. Si el número de
 * casillas cambiara al avanzar (`1 2 … 112` en la primera, `1 … 4 5 6 … 112` en la
 * quinta), la flecha «siguiente» se correría bajo el cursor y un segundo clic caería
 * en otra casilla. Por lo mismo un `…` nunca tapa una sola página: ocuparía el mismo
 * sitio que el número que esconde.
 */
function posicionesVisibles(actual: number, total: number): Posicion[] {
  if (total <= POSICIONES) {
    return Array.from({ length: total }, (_, indice) => indice + 1);
  }
  if (actual <= 4) {
    return [1, 2, 3, 4, 5, '…', total];
  }
  if (actual >= total - 3) {
    return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '…', actual - 1, actual, actual + 1, '…', total];
}

/**
 * Qué números muestra el panel: la primera, la actual y la última, con `…` donde se
 * saltan páginas. Es el mockup del usuario (`1 … 90` en la primera de 90). A
 * diferencia de `posicionesVisibles`, el grupo no mide siempre lo mismo: va de tres
 * posiciones (`1 … 90`) a cinco (`1 … 45 … 90`), así que «Siguiente» se corre un
 * poco al avanzar. Se aceptó a cambio del diseño más limpio.
 */
function posicionesDelPanel(actual: number, total: number): Posicion[] {
  const paginas = [...new Set([1, actual, total])].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const posiciones: Posicion[] = [];
  paginas.forEach((pagina, indice) => {
    const anterior = paginas[indice - 1];
    if (anterior !== undefined && pagina - anterior > 1) posiciones.push('…');
    posiciones.push(pagina);
  });
  return posiciones;
}

/** Casilla de número del panel: cuadrada, del alto del resto del pie (32 px y 36 desde `sm`). */
const NUMERO_DEL_PANEL =
  'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-bold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus sm:h-9 sm:min-w-10';

/** «Anterior» / «Siguiente» del panel: texto gris, sin casilla. Deshabilitado se queda del mismo gris, como en el mockup: solo deja de responder. */
const FLECHA_DEL_PANEL =
  'flex h-8 items-center gap-1 rounded-lg px-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-[#001631] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus disabled:pointer-events-none sm:h-9 dark:text-zinc-500 dark:hover:text-white';

/**
 * Anterior, números y siguiente del panel (mockup del usuario, 2026-10-20). Sin bordes
 * ni casillas unidas: la página actual se marca con su fondo gris, y el resto son
 * números sueltos que toman ese fondo, más claro, al pasar el puntero.
 *
 * Se exporta porque `Paginador` reparte el pie del panel: este grupo a la izquierda,
 * e «Ir a la página» con «Filas por página» a la derecha.
 */
export function GrupoDelPanel({
  pagina,
  totalPaginas,
  onCambiarPagina,
}: {
  pagina: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
}) {
  return (
    <ul className="flex items-center gap-2 sm:gap-4 @max-xl:basis-full @max-xl:justify-center">
      <li>
        <button
          type="button"
          onClick={() => onCambiarPagina(pagina - 1)}
          disabled={pagina === 1}
          aria-label="Página anterior"
          className={FLECHA_DEL_PANEL}
        >
          <ChevronIcon direccion="izquierda" />
          <span className="hidden sm:inline">Anterior</span>
        </button>
      </li>

      {posicionesDelPanel(pagina, totalPaginas).map((posicion, indice) =>
        posicion === '…' ? (
          <li key={`hueco-${indice}`} aria-hidden="true">
            <span className="flex h-8 select-none items-center px-1 text-sm font-bold text-[#001631] sm:h-9 dark:text-[#f6f6f6]">
              …
            </span>
          </li>
        ) : (
          <li key={posicion}>
            <button
              type="button"
              onClick={() => onCambiarPagina(posicion)}
              aria-label={`Página ${posicion}`}
              aria-current={posicion === pagina ? 'page' : undefined}
              className={`${NUMERO_DEL_PANEL} ${
                posicion === pagina
                  ? 'bg-[#d9dce1] text-[#001631] dark:bg-zinc-700 dark:text-white'
                  : 'text-[#001631] hover:bg-zinc-100 dark:text-[#f6f6f6] dark:hover:bg-zinc-800'
              }`}
            >
              {posicion}
            </button>
          </li>
        )
      )}

      <li>
        <button
          type="button"
          onClick={() => onCambiarPagina(pagina + 1)}
          disabled={pagina === totalPaginas}
          aria-label="Página siguiente"
          className={FLECHA_DEL_PANEL}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronIcon direccion="derecha" />
        </button>
      </li>
    </ul>
  );
}

/**
 * «Ir a la página N»: para tablas largas, donde llegar a la 40 a golpe de flecha no
 * tiene sentido. Se envía con Enter. Un número fuera de rango se lleva al extremo más
 * cercano en vez de ignorarse: quien escribe 99 en una tabla de 12 páginas quiere ir
 * al final.
 */
export function IrAPagina({
  pagina,
  totalPaginas,
  onCambiarPagina,
  tono,
}: {
  pagina: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
  tono: Tono;
}) {
  const colores = COLORES[tono];
  const id = useId();
  const [valor, setValor] = useState('');

  const ir = (e: FormEvent) => {
    e.preventDefault();
    const numero = Number.parseInt(valor, 10);
    if (Number.isNaN(numero)) return;
    onCambiarPagina(Math.min(Math.max(numero, 1), totalPaginas));
    setValor('');
  };

  return (
    <form onSubmit={ir} className="flex items-center gap-2">
      <label htmlFor={`${id}-campo`} className={`shrink-0 text-sm font-medium ${colores.texto}`}>
        Ir a la página
      </label>
      <input
        id={`${id}-campo`}
        type="text"
        inputMode="numeric"
        enterKeyHint="go"
        autoComplete="off"
        aria-describedby={`${id}-total`}
        placeholder={String(pagina)}
        value={valor}
        // Solo dígitos: el campo es de texto (un `type="number"` pinta flechas que no
        // caben en este ancho) y así no hace falta avisar de nada al enviar.
        onChange={(e) => setValor(e.target.value.replace(/\D/g, ''))}
        className={`block h-8 ${ANCHO_DE_CAMPO} rounded-lg border px-2.5 text-center text-sm font-medium tabular-nums shadow-xs focus:outline-none focus:ring-1 sm:h-9 ${colores.campo}`}
      />
      <span id={`${id}-total`} className={`text-sm font-medium ${colores.texto}`}>
        de {totalPaginas}
      </span>
    </form>
  );
}

/**
 * «Filas por página»: con el mismo borde, alto y radio que las casillas del grupo,
 * para que la fila se lea como una sola pieza. Es `CustomSelect` y no un `<select>`:
 * la lista de un `<select>` la dibuja el navegador, sin borde ni esquinas. Se abre
 * hacia arriba porque va al pie de la tabla.
 *
 * Se exporta porque en el panel `Paginador` la pone sola, a la derecha del pie.
 */
export function FilasPorPagina({
  valor,
  opciones,
  onCambiar,
  tono,
}: FilasPorPaginaProps & { tono: Tono }) {
  const colores = COLORES[tono];
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className={`shrink-0 text-sm font-medium ${colores.texto}`}>
        Filas por página
      </span>
      <CustomSelect
        compacto
        abrirArriba
        paleta={colores.boton}
        // Con `aria-label` el lector no lee el contenido del botón: el valor va en él.
        ariaLabel={`Filas por página: ${valor}`}
        value={String(valor)}
        onChange={(v) => onCambiar(Number(v))}
        options={opciones.map(String)}
        className={ANCHO_DE_CAMPO}
      />
    </div>
  );
}

/**
 * Paginación de todas las tablas: anterior, números y siguiente (`GrupoDelPanel` en el
 * panel, casillas unidas en el sitio público), el campo «Ir a la página» y, si se pide,
 * «Filas por página». La usan
 * el panel, a través de `Paginador`, que le añade el «Mostrando X-Y», y las tablas
 * públicas directamente.
 *
 * Con una sola página no pinta las casillas ni «Ir a la página»; solo las filas por
 * página, si se pidieron (con 15 filas y 20 registros hay que poder pasar a 30).
 */
export function Paginacion({
  pagina,
  totalPaginas,
  onCambiarPagina,
  tono,
  ariaLabel = 'Paginación',
  porPagina,
  className = '',
}: PaginacionProps) {
  const colores = COLORES[tono];
  const variasPaginas = totalPaginas > 1;

  return (
    // Dentro de `Paginador` (que es el contenedor), cuando no cabe en una línea: las casillas
    // en su propia fila, centradas, y debajo «Ir a la página» y «Filas por página», también
    // centradas. Antes se partía donde caía y «Filas por página» quedaba sola, descolgada.
    // En el panel, páginas e «Ir a la página» van en una sola línea mientras quepan
    // (`@xl`, 36rem del contenedor) y por debajo se parten en dos, centradas. Es el caso
    // del historial de cargas, que usa `Paginacion` sin `Paginador`.
    <nav
      aria-label={ariaLabel}
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-3 ${
        tono === 'panel' ? '' : '@max-6xl:w-full'
      } ${className}`}
    >
      {variasPaginas && tono === 'panel' && (
        <GrupoDelPanel pagina={pagina} totalPaginas={totalPaginas} onCambiarPagina={onCambiarPagina} />
      )}

      {variasPaginas && tono === 'publico' && (
        <ul className="flex -space-x-px text-sm @max-6xl:basis-full @max-6xl:justify-center">
          <li>
            <button
              type="button"
              onClick={() => onCambiarPagina(pagina - 1)}
              disabled={pagina === 1}
              aria-label="Página anterior"
              className={`${CASILLA} ${FLECHA} rounded-s-lg ${colores.boton} ${colores.deshabilitado}`}
            >
              <ChevronIcon direccion="izquierda" />
              <span className="hidden sm:inline">Anterior</span>
            </button>
          </li>

          {posicionesVisibles(pagina, totalPaginas).map((posicion, indice) =>
            posicion === '…' ? (
              // `aria-hidden`: un lector de pantalla no gana nada oyendo «puntos
              // suspensivos»; ya oye «página 1» y «página 112» a cada lado.
              <li key={`hueco-${indice}`} aria-hidden="true">
                <span className={`${CASILLA} ${NUMERO} select-none ${colores.hueco}`}>…</span>
              </li>
            ) : (
              <li key={posicion}>
                <button
                  type="button"
                  onClick={() => onCambiarPagina(posicion)}
                  aria-label={`Página ${posicion}`}
                  aria-current={posicion === pagina ? 'page' : undefined}
                  className={`${CASILLA} ${NUMERO} ${
                    // `relative z-10`: su borde es de otro color y, sin subirla, las
                    // vecinas le taparían un píxel a cada lado.
                    posicion === pagina ? `relative z-10 ${colores.actual}` : colores.boton
                  }`}
                >
                  {posicion}
                </button>
              </li>
            )
          )}

          <li>
            <button
              type="button"
              onClick={() => onCambiarPagina(pagina + 1)}
              disabled={pagina === totalPaginas}
              aria-label="Página siguiente"
              className={`${CASILLA} ${FLECHA} rounded-e-lg ${colores.boton} ${colores.deshabilitado}`}
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronIcon direccion="derecha" />
            </button>
          </li>
        </ul>
      )}

      {variasPaginas && (
        <IrAPagina
          pagina={pagina}
          totalPaginas={totalPaginas}
          onCambiarPagina={onCambiarPagina}
          tono={tono}
        />
      )}

      {porPagina && <FilasPorPagina {...porPagina} tono={tono} />}
    </nav>
  );
}

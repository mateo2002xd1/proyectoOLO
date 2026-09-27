'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useOcultarAlBajar } from './use-ocultar-al-bajar';

/** Un destino de la barra, o una fila de la hoja que abre. */
export interface DestinoMobile {
  /** Identificador estable: `key` de React y qué hoja está abierta. */
  clave: string;
  /** Texto bajo el icono. Corto: a 320 px cada destino tiene unos 60 px. */
  etiqueta: string;
  /** En la barra siempre va; en una fila de la hoja puede faltar. */
  icono?: ReactNode;
  href?: string;
  /** Acción en vez de navegación, como abrir los avisos. */
  alPulsar?: () => void;
  /** Si el usuario está en esta sección. Con `hijos`, lo decide quien monta la barra. */
  activo?: boolean;
  /** Globo con un número (páginas pendientes). Cero o nada: no se pinta. */
  contador?: number;
  /** Con hijos, el destino no navega: abre una hoja desde abajo con ellos. */
  hijos?: DestinoMobile[];
}

interface NavegacionMobileProps {
  /** Los destinos a los lados del logo, en orden: la primera mitad va a la izquierda. */
  destinos: DestinoMobile[];
  /** El botón del centro: el logo de OLO, que lleva al Dashboard. */
  inicio: { href: string; etiqueta: string; logo: string; activo?: boolean };
  /** Nombre del `<nav>` para lectores de pantalla. */
  etiqueta?: string;
}

/** Mismo corte que `lg:` de Tailwind: desde aquí el panel tiene su barra lateral. */
const CONSULTA_ESCRITORIO = '(width >= 64rem)';

/**
 * El número de pendientes, en dos partes: el globo, que se ve pero no se lee, y una
 * frase oculta, que se lee después de la etiqueta («Revisión, 3 pendientes»). Con el
 * número suelto dentro del enlace, el lector decía «3 Revisión».
 */
function textoContador(cantidad?: number): { visible: string; oculto: string } | null {
  if (!cantidad || cantidad <= 0) return null;
  return {
    visible: cantidad > 99 ? '99+' : String(cantidad),
    oculto: `, ${cantidad} pendiente${cantidad === 1 ? '' : 's'}`,
  };
}

/**
 * Navegación mobile del panel: barra fija abajo en el móvil y la tablet, con el logo
 * en el centro, y una hoja que sube desde abajo para los destinos con hijos.
 *
 * Es del panel y solo del panel: la intranet tiene la suya en
 * `3001-intranet/src/shared/lib/mobile/`. No se comparte por `packages/` porque es
 * interfaz, y cada app lleva su identidad (`2-convenciones-del-proyecto.md` §10.5).
 * Los estilos están en `globals.css`, sección «NAVEGACIÓN MOBILE DEL PANEL».
 *
 * Se oculta desde `lg` por CSS, no por JavaScript: así el servidor pinta lo mismo que
 * el navegador y no hay parpadeo al hidratar.
 *
 * La hoja es un `<dialog>` nativo, como `ModalInactividad` en `@olo/inactividad`: trae
 * el foco atrapado, el cierre con Escape y la vuelta del foco al botón que la abrió
 * sin escribir nada. Está siempre montada y se abre o cierra con `showModal`/`close`;
 * desmontarla abierta dejaba el foco perdido en `<body>`.
 */
export function NavegacionMobile({ destinos, inicio, etiqueta = 'Navegación' }: NavegacionMobileProps) {
  // Qué grupo pinta la hoja y si está abierta van por separado: al cerrar, el
  // contenido se queda hasta que el diálogo se ha cerrado. Si se vaciaba antes, el
  // foco se quedaba en un elemento que ya no existía y `close()` no lo devolvía al
  // botón, sino a `<body>`.
  const [abiertaPedida, setAbiertaPedida] = useState(false);
  const [claveGrupo, setClaveGrupo] = useState<string | null>(null);
  const dialogoRef = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  const grupo = destinos.find((destino) => destino.clave === claveGrupo && destino.hijos?.length);
  const abierta = abiertaPedida && Boolean(grupo);
  const abrir = (clave: string) => {
    setClaveGrupo(clave);
    setAbiertaPedida(true);
  };
  const cerrar = () => setAbiertaPedida(false);
  // Se esconde al bajar por la página y vuelve al subir; con la hoja abierta, nunca.
  const oculta = useOcultarAlBajar(abierta);

  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;
    if (abierta && !dialogo.open) dialogo.showModal();
    if (!abierta && dialogo.open) dialogo.close();
  }, [abierta]);

  // Al girar una tablet a horizontal la barra se oculta (`display: none` desde `lg`) y
  // la hoja con ella, pero el diálogo seguiría abierto y la página, inerte y sin forma
  // de cerrarlo. Se cierra en cuanto la pantalla pasa a escritorio.
  useEffect(() => {
    if (!abierta || typeof window.matchMedia !== 'function') return;
    const consulta = window.matchMedia(CONSULTA_ESCRITORIO);
    const alCambiar = (evento: MediaQueryListEvent) => {
      if (evento.matches) setAbiertaPedida(false);
    };
    consulta.addEventListener('change', alCambiar);
    return () => consulta.removeEventListener('change', alCambiar);
  }, [abierta]);

  // Con un número impar de destinos sobra uno a la izquierda y el logo se desplaza
  // media casilla. El panel pasa un número par.
  const mitad = Math.ceil(destinos.length / 2);

  const pintarDestino = (destino: DestinoMobile) => {
    const contador = textoContador(destino.contador);
    const clase = `navegacion-mobile-destino${destino.activo ? ' es-activo' : ''}`;
    const contenido = (
      <>
        <span className="navegacion-mobile-icono">
          {destino.icono}
          {contador && (
            <span className="navegacion-mobile-contador" aria-hidden="true">
              {contador.visible}
            </span>
          )}
        </span>
        <span className="navegacion-mobile-etiqueta">{destino.etiqueta}</span>
        {contador && <span className="navegacion-mobile-oculto">{contador.oculto}</span>}
      </>
    );

    let control: ReactNode;
    if (destino.hijos?.length) {
      control = (
        <button
          type="button"
          className={clase}
          aria-haspopup="dialog"
          aria-expanded={abierta && claveGrupo === destino.clave}
          onClick={() => abrir(destino.clave)}
        >
          {contenido}
        </button>
      );
    } else if (destino.href) {
      control = (
        <Link href={destino.href} className={clase} aria-current={destino.activo ? 'page' : undefined}>
          {contenido}
        </Link>
      );
    } else {
      control = (
        <button type="button" className={clase} onClick={destino.alPulsar}>
          {contenido}
        </button>
      );
    }
    return <li key={destino.clave}>{control}</li>;
  };

  const pintarFila = (fila: DestinoMobile) => {
    const contador = textoContador(fila.contador);
    const clase = `navegacion-mobile-hoja-fila${fila.activo ? ' es-activo' : ''}`;
    const contenido = (
      <>
        <span className="navegacion-mobile-hoja-icono">{fila.icono}</span>
        <span className="navegacion-mobile-hoja-etiqueta">{fila.etiqueta}</span>
        {contador && (
          <>
            <span className="navegacion-mobile-hoja-contador" aria-hidden="true">
              {contador.visible}
            </span>
            <span className="navegacion-mobile-oculto">{contador.oculto}</span>
          </>
        )}
      </>
    );

    return (
      <li key={fila.clave}>
        {fila.href ? (
          <Link
            href={fila.href}
            className={clase}
            onClick={cerrar}
            aria-current={fila.activo ? 'page' : undefined}
          >
            {contenido}
          </Link>
        ) : (
          <button
            type="button"
            className={clase}
            onClick={() => {
              cerrar();
              fila.alPulsar?.();
            }}
          >
            {contenido}
          </button>
        )}
      </li>
    );
  };

  return (
    <nav className={`navegacion-mobile${oculta ? ' es-oculta' : ''}`} aria-label={etiqueta}>
      <ul className="navegacion-mobile-lista">
        {destinos.slice(0, mitad).map(pintarDestino)}
        <li className="navegacion-mobile-centro">
          <Link
            href={inicio.href}
            className={`navegacion-mobile-inicio${inicio.activo ? ' es-activo' : ''}`}
            aria-current={inicio.activo ? 'page' : undefined}
          >
            <span className="navegacion-mobile-logo">
              {/* SVG estático de `public/`: next/image no aporta optimización aquí. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={inicio.logo} alt="" width={28} height={32} />
            </span>
            <span className="navegacion-mobile-etiqueta">{inicio.etiqueta}</span>
          </Link>
        </li>
        {destinos.slice(mitad).map(pintarDestino)}
      </ul>

      {/* `onClick` y no `onMouseDown` para cerrar al tocar fuera: con `mousedown` la
          hoja desaparecía antes del `click`, y ese `click` caía en lo que hubiera
          debajo, que podía ser un enlace de la página. */}
      <dialog
        ref={dialogoRef}
        className="navegacion-mobile-hoja"
        aria-labelledby={idTitulo}
        onClose={cerrar}
        onClick={(evento) => {
          if (evento.target === evento.currentTarget) cerrar();
        }}
      >
        {grupo && (
          <div className="navegacion-mobile-hoja-caja">
            <div className="navegacion-mobile-hoja-cabecera">
              <h2 id={idTitulo} className="navegacion-mobile-hoja-titulo">
                {grupo.etiqueta}
              </h2>
              <button
                type="button"
                className="navegacion-mobile-hoja-cerrar"
                onClick={cerrar}
                aria-label="Cerrar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="navegacion-mobile-hoja-lista">{grupo.hijos?.map(pintarFila)}</ul>
          </div>
        )}
      </dialog>
    </nav>
  );
}

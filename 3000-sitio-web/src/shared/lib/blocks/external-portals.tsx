import type { CSSProperties, ReactNode } from 'react';
import { IconoRenderer } from '@olo/blocks-renderer';
import { CARPETA_ICONOS_DE_PORTALES } from './iconos-de-portales';

export interface TarjetaDePortal {
  id?: string;
  /** Ruta de un ícono de `ICONOS_DE_PORTALES`. */
  icono?: string;
  /** Campo `richtext` de Puck: llega ya convertido en nodos. */
  texto?: ReactNode;
  enlace?: string;
  colorFondo?: string;
}

interface ExternalPortalsProps {
  block: { id: string };
  tarjetas?: TarjetaDePortal[];
  /** Redondeo de las esquinas de afuera de la fila, en px. Vacío: rectas. */
  radioEsquinas?: number | '';
  /** En el editor las tarjetas no son enlaces: un clic para editar no debe navegar. */
  esEdicion?: boolean;
}

/** Color del ícono, sobre el círculo blanco. */
const AZUL_ICONO = '#001145';

/** Tope del redondeo: más allá la tarjeta deja de leerse como tarjeta. */
const RADIO_MAXIMO = 100;

/*
 * Las tres del diseño. Se usan cuando el bloque no trae `tarjetas`: una portada
 * guardada con la versión anterior (título, subtítulo y `portals`), que así se ve ya
 * con el diseño nuevo. El texto va en nodos porque el HTML de `defaultProps` solo lo
 * convierte Puck.
 */
const TARJETAS_POR_DEFECTO: TarjetaDePortal[] = [
  {
    id: 'pqrs',
    icono: `${CARPETA_ICONOS_DE_PORTALES}/pqrs.svg`,
    texto: (
      <strong>
        Molestia referente
        <br />a PQRS
      </strong>
    ),
    enlace: '#',
    colorFondo: '#001145',
  },
  {
    id: 'denuncias',
    icono: `${CARPETA_ICONOS_DE_PORTALES}/denuncia.svg`,
    texto: (
      <strong>
        Denuncia por
        <br />
        corrupción
      </strong>
    ),
    enlace: '#',
    colorFondo: '#85e501',
  },
  {
    id: 'transparencia',
    icono: `${CARPETA_ICONOS_DE_PORTALES}/transparencia.svg`,
    texto: <strong>Transparencia</strong>,
    enlace: '#',
    colorFondo: '#07ecfc',
  },
];

/**
 * Portales externos: una fila de tarjetas de color, cada una con un ícono en un círculo
 * blanco y un texto, unidas por una punta de flecha hacia la siguiente. En pantallas
 * angostas se apilan y la flecha apunta hacia abajo.
 *
 * Cada tarjeta entera es el enlace. El ícono es decorativo (`aria-hidden`): lo que dice
 * la tarjeta ya está en el texto.
 *
 * `radioEsquinas` redondea solo las esquinas de afuera de la fila (las tarjetas van
 * pegadas): lo lleva cada tarjeta de punta y no la fila con `overflow: hidden`, que
 * recortaría el anillo de foco.
 */
export function ExternalPortals({ block, tarjetas, radioEsquinas, esEdicion = false }: ExternalPortalsProps) {
  const lista = tarjetas ?? TARJETAS_POR_DEFECTO;
  if (lista.length === 0) return null;

  const radio = Math.min(RADIO_MAXIMO, Math.max(0, Number(radioEsquinas) || 0));
  const estiloFila = radio > 0 ? ({ '--olo-portales-radio': `${radio}px` } as CSSProperties) : undefined;

  return (
    <section className="olo-portales" aria-label="Portales externos" data-block-id={block.id}>
      <div className="olo-portales__fila" style={estiloFila}>
        {lista.map((tarjeta, indice) => {
          const estilo = { '--olo-portal-fondo': tarjeta.colorFondo || AZUL_ICONO } as CSSProperties;
          const contenido = (
            <>
              <span className="olo-portal__icono" aria-hidden="true">
                <IconoRenderer icono={tarjeta.icono} color={AZUL_ICONO} size={40} />
              </span>
              <span className="olo-portal__texto">{tarjeta.texto}</span>
            </>
          );
          const clave = tarjeta.id || indice;

          return esEdicion || !tarjeta.enlace ? (
            <div key={clave} className="olo-portal" style={estilo}>
              {contenido}
            </div>
          ) : (
            <a key={clave} href={tarjeta.enlace} className="olo-portal" style={estilo}>
              {contenido}
            </a>
          );
        })}
      </div>
    </section>
  );
}

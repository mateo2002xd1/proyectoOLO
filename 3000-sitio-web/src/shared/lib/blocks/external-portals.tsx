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
  /** En el editor las tarjetas no son enlaces: un clic para editar no debe navegar. */
  esEdicion?: boolean;
}

/** Color del ícono, sobre el círculo blanco. */
const AZUL_ICONO = '#001145';

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
 */
export function ExternalPortals({ block, tarjetas, esEdicion = false }: ExternalPortalsProps) {
  const lista = tarjetas ?? TARJETAS_POR_DEFECTO;
  if (lista.length === 0) return null;

  return (
    <section className="olo-portales" aria-label="Portales externos" data-block-id={block.id}>
      <div className="olo-portales__fila">
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

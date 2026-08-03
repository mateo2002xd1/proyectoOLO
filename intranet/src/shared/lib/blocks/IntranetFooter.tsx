import { Fragment } from 'react';
import type { CSSProperties } from 'react';

/**
 * El pie de la intranet: logos a la izquierda y columnas de texto y enlaces.
 *
 * Antes estaba escrito a mano de arriba abajo —los dos logos, los títulos, la
 * dirección, los teléfonos y los enlaces de política—, así que cambiar un
 * teléfono era tocar el código y desplegar. En el editor el bloque salía sin un
 * solo campo: se podía poner o quitar, nada más.
 *
 * Ahora todo el contenido son props. Los valores por defecto son EXACTAMENTE lo
 * que había escrito a mano, así que la plantilla ya publicada —que guarda el
 * bloque sin props (ver `scripts/migrar-plantilla-intranet.ts`)— sigue pintando
 * el mismo pie hasta que alguien lo edite.
 *
 * El número de columnas también es libre: la rejilla se calcula aquí y viaja al
 * CSS en `--intranet-footer-columnas`. Va como variable, y no como
 * `grid-template-columns` en línea, porque un estilo en línea le ganaría a la
 * media query que apila el pie en móvil y dejaría tres columnas apretadas en una
 * pantalla de teléfono.
 */

/** Una línea de una columna: párrafo suelto, o enlace si trae `url`. */
export interface LineaPie {
  texto?: string;
  url?: string;
  /** Deja aire encima. Es lo que separa hoy la línea de redes del resto. */
  separada?: boolean;
}

export interface ColumnaPie {
  titulo?: string;
  lineas?: LineaPie[];
}

export interface LogoPie {
  src?: string;
  alt?: string;
  /** Ancho en píxeles. La altura la resuelve el navegador por proporción. */
  ancho?: number;
}

export interface IntranetFooterProps {
  logos?: LogoPie[];
  columnas?: ColumnaPie[];
}

export const LOGOS_POR_DEFECTO: LogoPie[] = [
  { src: '/assets/svg/logo-sena.svg', alt: 'Logo SENA', ancho: 56 },
  { src: '/assets/svg/olo-logo-horizontal.svg', alt: 'Logo Observatorio', ancho: 150 },
];

export const COLUMNAS_POR_DEFECTO: ColumnaPie[] = [
  {
    titulo: 'Observatorio Laboral y Ocupacional SENA',
    lineas: [
      { texto: 'Dirección: Calle 57 No. 8 - 69 Bogotá D.C. (Cundinamarca), Colombia.' },
      { texto: 'Horario de atención: Lunes a viernes de 8:00 am a 5:30 pm' },
      { texto: '@SENACOMUNICA @SENATV', separada: true },
    ],
  },
  {
    titulo: 'Contacto:',
    lineas: [
      { texto: 'PBX (+57) 1 5461500 IP: 13037' },
      { texto: 'olaboryocupacional@sena.edu.co' },
      { texto: 'Política de seguridad y privacidad de la información', url: '#' },
      { texto: 'Política de Tratamiento para Protección de Datos Personales', url: '#' },
      { texto: 'Mapa del sitio', url: '#' },
    ],
  },
];

/**
 * La plantilla de la rejilla: una pista fija para los logos y una parte igual
 * para cada columna de texto. Sin columnas se devuelve `undefined` para que el
 * CSS use su valor por defecto, porque `repeat(0, 1fr)` no es válido y dejaría
 * la declaración entera sin efecto.
 */
function plantillaDeColumnas(conLogos: boolean, cuantasColumnas: number): string | undefined {
  const pistas = [conLogos ? '180px' : null, cuantasColumnas > 0 ? `repeat(${cuantasColumnas}, 1fr)` : null];
  const usadas = pistas.filter(Boolean);
  return usadas.length > 0 ? usadas.join(' ') : undefined;
}

export function IntranetFooter({
  logos = LOGOS_POR_DEFECTO,
  columnas = COLUMNAS_POR_DEFECTO,
}: IntranetFooterProps) {
  // Un logo sin imagen no pinta nada y solo dejaría un hueco con el separador.
  const logosVisibles = logos.filter((logo) => logo.src);

  const estiloRejilla = {
    '--intranet-footer-columnas': plantillaDeColumnas(logosVisibles.length > 0, columnas.length),
  } as CSSProperties;

  return (
    <footer className="intranet-footer" aria-label="Pie de página">
      <div className="intranet-footer-inner" style={estiloRejilla}>
        {logosVisibles.length > 0 && (
          <div className="intranet-footer-col intranet-footer-brand-col">
            <div className="intranet-footer-brand">
              {logosVisibles.map((logo, indice) => (
                <Fragment key={`${logo.src}-${indice}`}>
                  {/* La barra separa logos, así que no va antes del primero. */}
                  {indice > 0 && <span>|</span>}
                  {/* src editable desde el editor: next/image exigiria dimensiones fijas */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logo.src}
                    alt={logo.alt ?? ''}
                    width={logo.ancho ?? 56}
                    height={logo.ancho ?? 56}
                  />
                </Fragment>
              ))}
            </div>
          </div>
        )}

        {columnas.map((columna, indice) => (
          <div className="intranet-footer-col" key={`${columna.titulo ?? 'columna'}-${indice}`}>
            {columna.titulo && <h2>{columna.titulo}</h2>}
            {(columna.lineas ?? []).map((linea, indiceLinea) => {
              const clave = `${linea.texto ?? 'linea'}-${indiceLinea}`;
              const clase = linea.separada ? 'intranet-footer-social' : undefined;

              // Sin URL es un dato, no un destino: se pinta como texto en vez de
              // como un enlace que no lleva a ninguna parte.
              return linea.url ? (
                <a key={clave} href={linea.url} className={clase}>
                  {linea.texto}
                </a>
              ) : (
                <p key={clave} className={clase}>
                  {linea.texto}
                </p>
              );
            })}
          </div>
        ))}
      </div>
    </footer>
  );
}

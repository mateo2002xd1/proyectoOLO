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

export interface LineaPie {
  texto?: string;
  url?: string;
  /** Deja aire encima. Es lo que separa hoy la línea de redes del resto. */
  separada?: boolean;
  icono?: string;
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

export interface RedSocial {
  plataforma?: string;
  url?: string;
  icono?: string;
}

export interface IntranetFooterProps {
  logos?: LogoPie[];
  columnas?: ColumnaPie[];
  redes?: RedSocial[];
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
      { texto: '@senacomunica', url: 'https://www.instagram.com/senacomunica/', icono: '/assets/svg/instagram.svg', separada: true },
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

export const REDES_POR_DEFECTO: RedSocial[] = [
  { plataforma: '@senacomunica', url: 'https://www.instagram.com/senacomunica/', icono: '/assets/svg/instagram.svg' },
  { plataforma: '@SENATV', url: 'https://www.youtube.com/@SENAComunica' },
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
  columnas: propsColumnas,
  redes = REDES_POR_DEFECTO,
}: IntranetFooterProps) {
  // Inyectar el ícono de Instagram automáticamente si los datos vienen de DB (propsColumnas)
  // pero aún tienen el texto viejo "@SENACOMUNICA @SENATV" para mantener retrocompatibilidad
  let columnas = propsColumnas ?? COLUMNAS_POR_DEFECTO;
  if (propsColumnas) {
    columnas = propsColumnas.map(col => {
      if (col.lineas?.some(l => l.texto?.includes('@SENACOMUNICA @SENATV'))) {
        return {
          ...col,
          lineas: col.lineas.filter(l => !l.texto?.includes('@SENACOMUNICA @SENATV'))
        };
      }
      return col;
    });
  }

  // Un logo sin imagen no pinta nada y solo dejaría un hueco con el separador.
  const logosVisibles = logos.filter((logo) => logo.src);
  const redesVisibles = redes.filter(red => red.plataforma || red.url);

  const estiloRejilla = {
    '--intranet-footer-columnas': plantillaDeColumnas(logosVisibles.length > 0, columnas.length + (redesVisibles.length > 0 ? 1 : 0)),
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

              const contenido = (
                <span className="flex items-center gap-1.5">
                  {linea.icono && (
                    <img src={linea.icono} alt="" className="w-5 h-5 object-contain" />
                  )}
                  <span>{linea.texto}</span>
                </span>
              );

              // Sin URL es un dato, no un destino: se pinta como texto en vez de
              // como un enlace que no lleva a ninguna parte.
              return linea.url ? (
                <a key={clave} href={linea.url} className={clase}>
                  {contenido}
                </a>
              ) : (
                <div key={clave} className={clase}>
                  {contenido}
                </div>
              );
            })}
          </div>
        ))}

        {redesVisibles.length > 0 && (
          <div className="intranet-footer-col">
            <h2>Redes Sociales</h2>
            <div className="flex flex-col gap-2 mt-1">
              {redesVisibles.map((red, indice) => (
                <a 
                  key={indice} 
                  href={red.url || '#'} 
                  className="intranet-footer-social flex items-center gap-1.5"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {red.icono && (
                    <img src={red.icono} alt="" className="w-5 h-5 object-contain" />
                  )}
                  <span>{red.plataforma}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}

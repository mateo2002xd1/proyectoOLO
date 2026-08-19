import { resaltar } from './resaltar';

/**
 * Una imagen ancha con título opcional.
 *
 * Cubre las secciones que son «un titular y una imagen grande»: el #datoOLO de
 * inicio, el «sabías que» de matriz y las dos capturas de resultados de la
 * encuesta de seguimiento laboral.
 *
 * `ancho` distingue los dos tamaños que ya existían: «contenido» es la caja
 * estrecha con esquinas redondeadas del «sabías que», y «completo» la imagen a
 * todo lo ancho del contenedor.
 */
/** Solo se aplican en la variante «completo»: en «contenido» el redondeado ya
 *  lo fija `.matriz-sabias-que img` en globals.css con más especificidad que
 *  una clase de Tailwind, así que exponerlo ahí no haría nada. */
const CLASES_AJUSTE: Record<string, string> = {
  cover: 'object-cover',
  contain: 'object-contain',
};
const CLASES_REDONDEADO: Record<string, string> = {
  ninguno: '',
  pequeno: 'rounded-md',
  grande: 'rounded-xl',
  circular: 'rounded-full',
};

export interface ImagenDestacadaProps {
  titulo?: string;
  imagenSrc?: string;
  imagenAlt?: string;
  ancho?: 'contenido' | 'completo';
  fondo?: 'blanco' | 'gris';
  ajusteImagen?: 'cover' | 'contain';
  redondeado?: 'ninguno' | 'pequeno' | 'grande' | 'circular';
}

export function ImagenDestacada({
  titulo,
  imagenSrc,
  imagenAlt = '',
  ancho = 'completo',
  fondo = 'blanco',
  // Mismos valores que llevaban las clases a mano en la variante «completo»:
  // una página ya publicada sin estos campos se sigue viendo igual.
  ajusteImagen = 'contain',
  redondeado = 'grande',
}: ImagenDestacadaProps) {
  if (!imagenSrc) return null;

  const clasesFondo = fondo === 'gris' ? 'matriz-section-gray' : 'matriz-section-white';

  if (ancho === 'contenido') {
    return (
      <div className={clasesFondo}>
        <div className="matriz-sabias-que">
          {/* src editable desde el editor: next/image exigiria dimensiones fijas */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagenSrc} alt={imagenAlt} className="w-full h-auto object-contain" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${clasesFondo} w-full py-12`}>
      <div className="max-w-[1200px] w-full mx-auto px-6 text-center flex flex-col items-center">
        {titulo && (
          <h2 className="matriz-section-title text-[#041E42] font-bold mb-6">{resaltar(titulo)}</h2>
        )}
        <div className="w-full">
          {/* src editable desde el editor: next/image exigiria dimensiones fijas */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagenSrc}
            alt={imagenAlt}
            className={`w-full max-w-[1200px] mx-auto h-auto shadow-sm ${CLASES_AJUSTE[ajusteImagen] ?? CLASES_AJUSTE.contain} ${CLASES_REDONDEADO[redondeado] ?? ''}`}
          />
        </div>
      </div>
    </div>
  );
}

import type { CSSProperties } from 'react';

/** Cómo se repite la imagen de fondo. Son los valores de `background-repeat` en CSS. */
export const REPETICIONES_DE_FONDO = {
  'no-repeat': { label: 'No repetir' },
  repeat: { label: 'Repetir' },
} as const;

export type RepeticionDeFondo = keyof typeof REPETICIONES_DE_FONDO;

/** La tarjeta «Imagen de fondo» del panel (`campoImagenDeFondo` en `puck.config.tsx`). */
export interface ImagenDeFondo {
  imagen?: string;
  /** 0 a 100: 0 se ve tal cual, 100 no se ve. Vacío: 0. */
  transparencia?: number | '';
  /** Vacía o desconocida: no se repite. */
  repeticion?: RepeticionDeFondo | '';
}

/**
 * La imagen de fondo de una sección, en su propia capa detrás del contenido.
 *
 * Va aparte y no en el `background` de la sección por la transparencia: la opacidad
 * de un fondo CSS no se puede bajar sin bajar también lo que lleva encima. Es la
 * misma solución de la portada del buscador de ocupaciones. Encima del color de fondo
 * de la sección: con transparencia, ese color se ve a través de la imagen.
 *
 * Sin repetir, cubre la sección entera y se recorta para llenarla. Repetida, va a su
 * tamaño real y se repite a lo ancho y a lo alto hasta llenarla, como un mosaico.
 *
 * La sección necesita la clase `olo-con-imagen-de-fondo` (globals.css), que la hace
 * contenedor de la capa. Es decorativa: no lleva texto alternativo.
 */
export function CapaDeImagenDeFondo({ fondo }: { fondo?: ImagenDeFondo }) {
  const imagen = fondo?.imagen?.trim();
  if (!imagen) return null;

  const transparencia = Math.min(100, Math.max(0, Number(fondo?.transparencia) || 0));
  const repeticion: RepeticionDeFondo =
    fondo?.repeticion && fondo.repeticion in REPETICIONES_DE_FONDO ? fondo.repeticion : 'no-repeat';

  const estilo: CSSProperties = {
    // `JSON.stringify` deja la ruta entre comillas y con las comillas internas
    // escapadas, que es lo que pide `url()` de CSS.
    backgroundImage: `url(${JSON.stringify(imagen)})`,
    backgroundRepeat: repeticion,
    backgroundSize: repeticion === 'no-repeat' ? 'cover' : 'auto',
    opacity: 1 - transparencia / 100,
  };

  return <div aria-hidden="true" className="olo-capa-imagen-de-fondo" style={estilo} />;
}

'use client';

/**
 * Campos del panel de Puck agrupados en acordeones, por tipo de bloque.
 *
 * Puck pinta los campos de un bloque uno debajo de otro, sin grupos. Su override
 * `fields` recibe todos como `children` (un elemento por campo, con el nombre del
 * campo como `key`), así que aquí se reparten: los campos «propios» del bloque en
 * un acordeón y los que se listan en `aparte` (hoy, `caja` = «Espaciado y Ancho»)
 * cada uno en el suyo. El valor de cada campo no cambia: solo dónde se pinta, así
 * que las páginas guardadas no se tocan.
 *
 * El paquete no depende de `@puckeditor/core`, así que no sabe qué bloque está
 * seleccionado: cada app se lo pasa en `tipo` (ver su `puck-editor-wrapper.tsx`).
 * Un tipo que no esté en `GRUPOS_DE_CAMPOS` se pinta como siempre.
 */

import { Children, type ReactElement, type ReactNode } from 'react';
import { AcordeonDeCampo, TituloYaPuestoContext } from './campos-en-acordeon';

export interface GrupoDeCampos {
  /** Título del acordeón con los campos propios del bloque: «Opciones del botón». */
  titulo: string;
  /** Campos que van en su propio acordeón: nombre del campo → título. */
  aparte: Record<string, string>;
}

export const GRUPOS_DE_CAMPOS: Record<string, GrupoDeCampos> = {
  BotonPersonalizado: {
    titulo: 'Opciones del botón',
    aparte: { caja: 'Espaciado y Ancho' },
  },
};

const nombreDelCampo = (hijo: ReactElement) => String(hijo.key ?? '').replace(/^\.\$/, '');

export function CamposAgrupados({ tipo, children }: { tipo?: string; children?: ReactNode }) {
  const grupo = tipo && Object.hasOwn(GRUPOS_DE_CAMPOS, tipo) ? GRUPOS_DE_CAMPOS[tipo] : undefined;
  if (!grupo) return <>{children}</>;

  const hijos = Children.toArray(children) as ReactElement[];
  const propios = hijos.filter((h) => !Object.hasOwn(grupo.aparte, nombreDelCampo(h)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <AcordeonDeCampo etiqueta={grupo.titulo} abiertoAlInicio>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{propios}</div>
      </AcordeonDeCampo>
      {Object.entries(grupo.aparte).map(([campo, titulo]) => {
        const hijo = hijos.find((h) => nombreDelCampo(h) === campo);
        if (!hijo) return null;
        return (
          <AcordeonDeCampo key={campo} etiqueta={titulo}>
            {/* El acordeón de fuera ya dice el título: el grupo de dentro no lo repite. */}
            <TituloYaPuestoContext.Provider value={true}>{hijo}</TituloYaPuestoContext.Provider>
          </AcordeonDeCampo>
        );
      })}
    </div>
  );
}

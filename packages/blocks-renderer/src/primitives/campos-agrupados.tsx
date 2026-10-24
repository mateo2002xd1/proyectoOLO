'use client';

/**
 * Campos del panel de Puck agrupados en acordeones, por tipo de bloque.
 *
 * Puck pinta los campos de un bloque uno debajo de otro, sin grupos. Su override
 * `fields` recibe todos como `children` (un elemento por campo, con el nombre del
 * campo como `key`), así que aquí se reparten en dos acordeones: los campos
 * «propios» del bloque ("Opciones del botón") y los de `aparte` (hoy `caja` =
 * «Espaciado y Ancho»). El valor de cada campo no cambia: solo dónde se pinta, así
 * que las páginas guardadas no se tocan.
 *
 * Dentro del primero, cada campo lleva su acordeón. Casi todos ya lo son (se
 * declaran con `campoEnAcordeon`, que les da el mismo borde, esquina y alto, y una
 * línea de ayuda). Los que tienen que seguir siendo campos nativos de Puck —el texto
 * del botón se edita también sobre la página, y eso solo lo hace un `text` nativo—
 * se listan en `envueltos`: se meten en su acordeón desde aquí, con la etiqueta de
 * Puck oculta (ver `crearEtiquetaDeCampo`) porque ya la pone la cabecera.
 *
 * El paquete no depende de `@puckeditor/core`, así que no sabe qué bloque está
 * seleccionado: cada app se lo pasa en `tipo` y `valores` (ver su
 * `puck-editor-wrapper.tsx`). Un tipo que no esté en `GRUPOS_DE_CAMPOS` se pinta
 * como siempre.
 */

import { Children, useContext, type ComponentType, type ReactElement, type ReactNode } from 'react';
import { AcordeonDeCampo, AyudaDeCampo, TituloYaPuestoContext } from './campos-en-acordeon';
import { COLOR_FOCO_CAMPO } from './estilos-de-campos';

export interface CampoEnvuelto {
  titulo: string;
  /** Una frase: para qué sirve. */
  ayuda: string;
  /** Lo que se ve en la cabecera plegada, a partir de los valores del bloque. */
  resumen?: (valores: Record<string, any>) => string;
}

export interface GrupoDeCampos {
  /** Título del acordeón con los campos propios del bloque: «Opciones del botón». */
  titulo: string;
  /** Campos nativos que se meten en un acordeón desde aquí: nombre del campo → su acordeón. */
  envueltos: Record<string, CampoEnvuelto>;
  /** Campos que van en su propio acordeón fuera del primero: nombre del campo → título. */
  aparte: Record<string, string>;
}

export const GRUPOS_DE_CAMPOS: Record<string, GrupoDeCampos> = {
  BotonPersonalizado: {
    titulo: 'Opciones del botón',
    envueltos: {
      texto: {
        titulo: 'Texto del botón',
        ayuda: 'Lo que dice el botón. También se escribe directo sobre la página.',
        resumen: (valores) => (typeof valores.texto === 'string' ? valores.texto : ''),
      },
    },
    aparte: { caja: 'Espaciado y Ancho' },
  },
};

const nombreDelCampo = (hijo: ReactElement) => String(hijo.key ?? '').replace(/^\.\$/, '');

/**
 * Un campo nativo de Puck (texto) con las medidas de los demás controles del panel:
 * 40 de alto, esquina de 8, borde gris y el mismo borde azul al enfocarlo.
 */
const ESTILO_NATIVO = `
[data-olo-campo-nativo] input[type="text"]{width:100%;min-height:40px;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;background:#fff;color:#333;font:inherit;font-size:14px;box-sizing:border-box;transition:border-color 150ms ease,box-shadow 150ms ease}
[data-olo-campo-nativo] input[type="text"]:focus,[data-olo-campo-nativo] input[type="text"]:focus-visible{outline:none;border-color:${COLOR_FOCO_CAMPO};box-shadow:0 0 0 3px rgba(0,22,49,.14)}
`;

export function CamposAgrupados({
  tipo,
  valores = {},
  children,
}: {
  tipo?: string;
  /** Los valores del bloque seleccionado, para los resúmenes de las cabeceras. */
  valores?: Record<string, any>;
  children?: ReactNode;
}) {
  const grupo = tipo && Object.hasOwn(GRUPOS_DE_CAMPOS, tipo) ? GRUPOS_DE_CAMPOS[tipo] : undefined;
  if (!grupo) return <>{children}</>;

  const hijos = Children.toArray(children) as ReactElement[];
  const propios = hijos.filter((h) => !Object.hasOwn(grupo.aparte, nombreDelCampo(h)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <AcordeonDeCampo etiqueta={grupo.titulo} abiertoAlInicio>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {propios.map((hijo) => {
            const envuelto = Object.hasOwn(grupo.envueltos, nombreDelCampo(hijo))
              ? grupo.envueltos[nombreDelCampo(hijo)]
              : undefined;
            if (!envuelto) return hijo;
            return (
              <AcordeonDeCampo
                key={nombreDelCampo(hijo)}
                etiqueta={envuelto.titulo}
                resumen={envuelto.resumen?.(valores)}
              >
                <style href="olo-estilos-de-campo-nativo" precedence="default">
                  {ESTILO_NATIVO}
                </style>
                <div data-olo-campo-nativo>
                  <TituloYaPuestoContext.Provider value={true}>{hijo}</TituloYaPuestoContext.Provider>
                </div>
                <AyudaDeCampo>{envuelto.ayuda}</AyudaDeCampo>
              </AcordeonDeCampo>
            );
          })}
        </div>
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

/**
 * Reemplazo de `overrides.fieldLabel`: dentro de un acordeón que ya pone el título
 * (`TituloYaPuestoContext`) el campo nativo se pinta sin su etiqueta; fuera, con la de
 * Puck de siempre. Recibe el `FieldLabel` de Puck porque este paquete no lo importa.
 */
export function crearEtiquetaDeCampo<P extends { children?: ReactNode }>(PorDefecto: ComponentType<P>) {
  return function EtiquetaDeCampo(props: P) {
    const tituloYaPuesto = useContext(TituloYaPuestoContext);
    return tituloYaPuesto ? <>{props.children}</> : <PorDefecto {...props} />;
  };
}

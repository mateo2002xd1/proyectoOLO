'use client';

/**
 * Panel de opciones de un bloque en Puck: la misma vista para todos.
 *
 * Puck pinta los campos de un bloque uno debajo de otro, sin grupos. Su override
 * `fields` recibe todos como `children` (un elemento por campo, con el nombre del
 * campo como `key`), así que aquí se reparten en dos acordeones padre, con la cabecera en
 * gris translúcido: las opciones propias del bloque («Opciones del bloque») y `caja`
 * («Espaciado y Ancho», que `conCaja` añade a todos). El valor de cada campo no cambia:
 * solo dónde se pinta, así que las páginas guardadas no se tocan.
 *
 * Dentro del primero, cada campo es un acordeón, sin rayas ni sangrado, con las mismas
 * medidas (40 de alto, esquina de 8; opciones sueltas con esquina de 12):
 * - Los que ya lo son (`campoEnAcordeon` y compañía, marcados con `enAcordeon`) se dejan.
 * - Los nativos de Puck que llevan un control simple (`text`, `textarea`, `number`,
 *   `select`, `radio`) se meten en su acordeón desde aquí, con su línea de ayuda si el
 *   campo la declara en `metadata.ayuda`, y con la etiqueta de Puck oculta (ver `crearEtiquetaDeCampo`) porque ya la pone la cabecera. Siguen siendo
 *   nativos a propósito: el texto de un bloque se edita también sobre la página, y eso
 *   solo lo hace un `text` nativo.
 * - El resto (texto enriquecido, listas, selectores de imagen o de color propios del
 *   bloque…) se pinta como siempre, dentro del mismo grupo: envolverlos duplicaría el
 *   título que dibujan ellos mismos o escondería el de sus campos hijos.
 *
 * El paquete no depende de `@puckeditor/core`, así que no sabe qué bloque está
 * seleccionado: cada app se lo pasa (ver su `puck-editor-wrapper.tsx`). `todos` decide si
 * se agrupan todos los bloques o solo los de `GRUPOS_DE_CAMPOS`.
 */

import { Children, useContext, type ComponentType, type ReactElement, type ReactNode } from 'react';
import { AcordeonDeCampo, AyudaDeCampo, SinLineasContext, TituloYaPuestoContext } from './campos-en-acordeon';
import { COLOR_FOCO_CAMPO } from './estilos-de-campos';

export interface GrupoDeCampos {
  /** Título del acordeón con los campos propios del bloque. */
  titulo: string;
}

/** Bloques con un título propio para su acordeón de opciones; los demás, «Opciones del bloque». */
export const GRUPOS_DE_CAMPOS: Record<string, GrupoDeCampos> = {
  BotonPersonalizado: { titulo: 'Opciones del botón' },
};

const TITULO_POR_DEFECTO = 'Opciones del bloque';
const TITULO_CAJA = 'Espaciado y Ancho';
const CAMPO_CAJA = 'caja';

/** Gris translúcido: cabecera de los acordeones padre. */
const FONDO_PADRE = 'rgba(107, 114, 128, 0.08)';

/** Tipos de Puck con un control simple, que se pueden envolver sin perder nada. */
const NATIVOS_SIMPLES = new Set(['text', 'textarea', 'number', 'select', 'radio']);

const nombreDelCampo = (hijo: ReactElement) => String(hijo.key ?? '').replace(/^\.\$/, '');

const yaEsAcordeon = (def: any) => def?.enAcordeon === true || Boolean(def?.metadata?.oloAcordeon);

function resumenNativo(def: any, valor: unknown): string {
  if (def.type === 'select' || def.type === 'radio') {
    return (def.options ?? []).find((o: { value: unknown; label?: string }) => o.value === valor)?.label ?? '';
  }
  return typeof valor === 'string' || typeof valor === 'number' ? String(valor) : '';
}

/**
 * Cada campo llega de Puck dentro de un `div` suyo con 16 px de relleno y, entre vecinos, una
 * raya arriba (`PuckFields-field`). Dentro de estos acordeones sobra: sangraba los campos y
 * dibujaba líneas entre ellos. Se anula aquí, y el margen de los lados lo pone el grupo.
 */
const ESTILO_GRUPO = `
[data-olo-grupo] [class*="PuckFields-field"]{padding:0!important;margin:0!important;border:0!important}
`;

/**
 * Los controles nativos de Puck con las medidas de los demás controles del panel: 40 de alto,
 * esquina de 8, borde gris y el mismo borde azul al enfocarlos; y las opciones sueltas
 * (`radio`) como botones separados con esquina de 12, igual que `OpcionesSegmentadas`.
 */
const ESTILO_NATIVO = `
[data-olo-grupo] [class*="Input-input"]{width:100%;min-height:40px;padding:8px 10px;border:1px solid #d1d5db!important;border-radius:8px!important;background:#fff;color:#333;font:inherit;font-size:14px;box-sizing:border-box;transition:border-color 150ms ease,box-shadow 150ms ease}
[data-olo-grupo] textarea[class*="Input-input"]{line-height:1.45}
[data-olo-grupo] [class*="Input-input"]:focus,[data-olo-grupo] [class*="Input-input"]:focus-visible{outline:none;border-color:${COLOR_FOCO_CAMPO}!important;box-shadow:0 0 0 3px rgba(0,22,49,.14)}
[data-olo-grupo] [class*="Input-radioGroupItems"]{display:flex;flex-wrap:wrap;gap:8px;border:0!important;border-radius:0!important;overflow:visible}
[data-olo-grupo] [class*="Input-radio_"]{flex:1 1 auto;border:1px solid #d1d5db!important;border-radius:12px!important;overflow:hidden}
[data-olo-grupo] [class*="Input-radioInner"]{display:flex;align-items:center;justify-content:center;min-height:40px;padding:8px 14px;border-radius:0!important;font-size:14px;text-align:center}
[data-olo-grupo] [class*="Input-radio_"]:has(input:checked){border-color:${COLOR_FOCO_CAMPO}!important;box-shadow:inset 0 0 0 1px ${COLOR_FOCO_CAMPO}}
`;

export function CamposAgrupados({
  tipo,
  campos = {},
  valores = {},
  todos = false,
  children,
}: {
  tipo?: string;
  /** Las definiciones de campo del bloque seleccionado (`config.components[tipo].fields`). */
  campos?: Record<string, any>;
  /** Los valores del bloque seleccionado, para los resúmenes de las cabeceras. */
  valores?: Record<string, any>;
  /** Agrupar cualquier bloque, no solo los de `GRUPOS_DE_CAMPOS`. */
  todos?: boolean;
  children?: ReactNode;
}) {
  const propio = tipo && Object.hasOwn(GRUPOS_DE_CAMPOS, tipo) ? GRUPOS_DE_CAMPOS[tipo] : undefined;
  if (!tipo || (!propio && !todos)) return <>{children}</>;

  const hijos = Children.toArray(children) as ReactElement[];
  const opciones = hijos.filter((h) => nombreDelCampo(h) !== CAMPO_CAJA);
  const caja = hijos.find((h) => nombreDelCampo(h) === CAMPO_CAJA);

  const pintarCampo = (hijo: ReactElement) => {
    const nombre = nombreDelCampo(hijo);
    const def = campos[nombre];
    if (!def || yaEsAcordeon(def) || !NATIVOS_SIMPLES.has(def.type)) return hijo;
    return (
      <AcordeonDeCampo key={nombre} etiqueta={def.label ?? nombre} resumen={resumenNativo(def, valores[nombre])}>
        {typeof def.metadata?.ayuda === 'string' && <AyudaDeCampo>{def.metadata.ayuda}</AyudaDeCampo>}
        {/* La cabecera ya dice el título: Puck no lo repite sobre el control. */}
        <TituloYaPuestoContext.Provider value={true}>{hijo}</TituloYaPuestoContext.Provider>
      </AcordeonDeCampo>
    );
  };

  return (
    <SinLineasContext.Provider value={true}>
      {/* 16 px a los lados, como el relleno que Puck da a sus propios campos. */}
      <div data-olo-grupo style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 16px 16px' }}>
        <style href="olo-estilos-de-grupo" precedence="default">
          {ESTILO_GRUPO + ESTILO_NATIVO}
        </style>
        {opciones.length > 0 && (
          <AcordeonDeCampo
            etiqueta={propio?.titulo ?? TITULO_POR_DEFECTO}
            abiertoAlInicio
            anidado
            fondoCabecera={FONDO_PADRE}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{opciones.map(pintarCampo)}</div>
          </AcordeonDeCampo>
        )}
        {caja && (
          <AcordeonDeCampo etiqueta={TITULO_CAJA} anidado fondoCabecera={FONDO_PADRE}>
            {/* El acordeón de fuera ya dice el título: el grupo de dentro no lo repite. */}
            <TituloYaPuestoContext.Provider value={true}>{caja}</TituloYaPuestoContext.Provider>
          </AcordeonDeCampo>
        )}
      </div>
    </SinLineasContext.Provider>
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

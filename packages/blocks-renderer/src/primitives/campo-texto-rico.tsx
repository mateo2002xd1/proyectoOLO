/**
 * Campo `richtext` de Puck con la barra de formato del OLO: encabezados H1–H6,
 * viñetas, negrita, cursiva, subrayado y alineación a la izquierda, al centro o a la
 * derecha. Es la misma barra en todos los textos enriquecidos de las dos apps.
 *
 * **Por qué una barra propia y no la de Puck.** La de Puck trae también listas
 * numeradas y «justificado», y su selector de listas ofrece «Numbered list» aunque
 * la extensión esté apagada (mira `listItem`, no `orderedList`): un botón que no hace
 * nada. Con `renderMenu` se arma con los controles sueltos de `RichTextMenu`.
 *
 * **Por qué `RichTextMenu` llega como parámetro.** Este paquete no depende de
 * `@puckeditor/core` (ver `ConfigDeBloque` en `controles-de-caja.tsx`): cada app lo
 * importa y llama una vez a `crearCampoTextoRico(RichTextMenu)`.
 *
 * La alineación se guarda como `style="text-align: …"` en el párrafo o el encabezado.
 * La API solo deja pasar ese `style` (`sanitizar-contenido.ts`); cualquier otro se borra.
 */

import type { ComponentType, ReactNode } from 'react';

/** Lo que se usa de `RichTextMenu` de Puck. */
interface MenuDeTextoRico {
  (props: { children: ReactNode }): ReactNode;
  Group: ComponentType<{ children: ReactNode }>;
  HeadingSelect: ComponentType;
  BulletList: ComponentType;
  Bold: ComponentType;
  Italic: ComponentType;
  Underline: ComponentType;
  AlignSelect: ComponentType;
}

/**
 * Opciones de TipTap del campo. Lo que no tiene botón (listas numeradas, citas,
 * tachado…) se quita de la barra, no de las extensiones, a propósito: Puck vuelve a
 * leer el HTML guardado con estas mismas extensiones al pintar la página, y apagar
 * una borraría ese formato de un texto ya publicado. `alignments` solo lo lee el
 * selector de alineación: la extensión de TipTap la configura Puck por su cuenta.
 */
export const OPCIONES_TEXTO_RICO = {
  heading: { levels: [1, 2, 3, 4, 5, 6] as (1 | 2 | 3 | 4 | 5 | 6)[] },
  textAlign: { alignments: ['left', 'center', 'right'] },
};

/**
 * Devuelve `campoTextoRico(label, opciones?)`. `opciones` se suma a `OPCIONES_TEXTO_RICO`
 * para el caso raro que necesita quitar algo más (p. ej. `{ link: false }` en un texto
 * que ya va dentro de un enlace).
 */
export function crearCampoTextoRico(RichTextMenu: MenuDeTextoRico) {
  function BarraDeTextoRico() {
    return (
      <RichTextMenu>
        <RichTextMenu.Group>
          <RichTextMenu.HeadingSelect />
          <RichTextMenu.BulletList />
        </RichTextMenu.Group>
        <RichTextMenu.Group>
          <RichTextMenu.Bold />
          <RichTextMenu.Italic />
          <RichTextMenu.Underline />
        </RichTextMenu.Group>
        <RichTextMenu.Group>
          <RichTextMenu.AlignSelect />
        </RichTextMenu.Group>
      </RichTextMenu>
    );
  }

  return function campoTextoRico(label: string, opciones: Record<string, unknown> = {}) {
    return {
      type: 'richtext' as const,
      label,
      contentEditable: true,
      options: { ...OPCIONES_TEXTO_RICO, ...opciones },
      // La misma barra en el panel y en la que flota sobre el lienzo al editar ahí.
      renderMenu: BarraDeTextoRico,
      renderInlineMenu: BarraDeTextoRico,
    };
  };
}

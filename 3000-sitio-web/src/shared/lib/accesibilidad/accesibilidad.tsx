'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useServerInsertedHTML } from 'next/navigation';
import { GuiaDeLectura } from './guia-de-lectura';
import { PestanaAccesibilidad } from './icono-accesibilidad';
import { ID_PANEL_ACCESIBILIDAD, PanelAccesibilidad } from './panel-accesibilidad';
import {
  aplicarAlDocumento,
  leerPreferencias,
  quitarDelDocumento,
  SCRIPT_ACCESIBILIDAD_ANTES_DE_PINTAR,
} from './preferencias';
import { useLectorEnVozAlta } from './use-lector-en-voz-alta';
import { usePreferenciasAccesibilidad } from './use-preferencias-accesibilidad';

const sinSuscripcion = () => () => {};
const enCliente = () => true;
const enServidor = () => false;

/**
 * Accesibilidad del sitio público: el botón pegado al borde derecho, que acompaña el
 * scroll, y el panel que abre. Lo monta `(pages)/layout.tsx`, así que el panel, el editor
 * y la vista previa no lo tienen.
 *
 * El botón, el panel y la guía de lectura salen por portal al `<body>`, fuera de
 * `.publico-layout`: las reglas de alto contraste, negrita o espaciado de `globals.css`
 * se escriben contra ese contenedor y así no deforman los controles con los que se
 * deshacen. Lo único que se pinta en el sitio es el filtro SVG del daltonismo, que tiene
 * que existir desde el HTML del servidor porque el script de antes de pintar ya puede
 * haberlo pedido.
 */
export function Accesibilidad() {
  const { preferencias, cambiar, restablecer } = usePreferenciasAccesibilidad();
  const [abierto, setAbierto] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);
  const enElNavegador = useSyncExternalStore(sinSuscripcion, enCliente, enServidor);

  useServerInsertedHTML(() => (
    <script
      id="olo-accesibilidad-antes-de-pintar"
      dangerouslySetInnerHTML={{ __html: SCRIPT_ACCESIBILIDAD_ANTES_DE_PINTAR }}
    />
  ));

  // Se aplica lo que dice el almacén y no `preferencias`: en el render de la hidratación
  // `preferencias` todavía son las del servidor (las predeterminadas) y quitarían lo que el
  // script de antes de pintar ya puso, con un parpadeo hasta el render siguiente.
  useEffect(() => {
    aplicarAlDocumento(leerPreferencias());
  }, [preferencias]);

  // Al salir del sitio público hacia el panel o el editor.
  useEffect(() => quitarDelDocumento, []);

  // Un video que ya estaba sonando no lo para el CSS.
  useEffect(() => {
    if (preferencias.pausarAnimaciones) document.querySelectorAll('video').forEach((video) => video.pause());
  }, [preferencias.pausarAnimaciones]);

  useLectorEnVozAlta(preferencias.lector);

  const cerrar = useCallback(() => {
    setAbierto(false);
    // Si el foco estaba dentro del panel, vuelve al botón en vez de perderse en el `<body>`.
    if (document.activeElement?.closest('[data-a11y-panel]')) boton.current?.focus();
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const alPulsarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') cerrar();
    };
    const alTocarFuera = (evento: PointerEvent) => {
      const objetivo = evento.target as Node;
      if (boton.current?.contains(objetivo)) return;
      if (objetivo instanceof Element && objetivo.closest('[data-a11y-panel]')) return;
      cerrar();
    };
    document.addEventListener('keydown', alPulsarTecla);
    document.addEventListener('pointerdown', alTocarFuera);
    return () => {
      document.removeEventListener('keydown', alPulsarTecla);
      document.removeEventListener('pointerdown', alTocarFuera);
    };
  }, [abierto, cerrar]);

  return (
    <>
      <FiltroDaltonismo />
      {enElNavegador &&
        createPortal(
          <>
            {preferencias.guia && <GuiaDeLectura />}
            <button
              ref={boton}
              type="button"
              className="olo-a11y-boton"
              aria-label="Opciones de accesibilidad"
              aria-expanded={abierto}
              aria-controls={ID_PANEL_ACCESIBILIDAD}
              onClick={() => (abierto ? cerrar() : setAbierto(true))}
            >
              <PestanaAccesibilidad />
            </button>
            <PanelAccesibilidad
              abierto={abierto}
              preferencias={preferencias}
              cambiar={cambiar}
              restablecer={restablecer}
              alCerrar={cerrar}
            />
          </>,
          document.body,
        )}
    </>
  );
}

/**
 * Una matriz por tipo de daltonismo, en el orden de `TIPOS_DE_DALTONISMO` (1, 2, 3).
 *
 * Es el método «daltonize»: se simula cómo ve la página esa persona (`S`), se toma lo que
 * pierde (la diferencia con el original) y se reparte hacia los canales que sí distingue
 * (`M`). La matriz es `I + M · (I − S)`; cada fila suma 1, así que el blanco y el gris no
 * cambian. `M` es la del daltonize original, [[0,0,0],[0.7,1,0],[0.7,0,1]], y `S`:
 *
 * - protanopia:   [[0.567,0.433,0],[0.558,0.442,0],[0,0.242,0.758]]
 * - deuteranopia: [[0.625,0.375,0],[0.7,0.3,0],[0,0.3,0.7]]
 * - tritanopia:   [[0.95,0.05,0],[0,0.433,0.567],[0,0.475,0.525]]
 */
const MATRICES_DE_DALTONISMO = [
  '1 0 0 0 0  -0.2549 1.2549 0 0 0  0.3031 -0.5451 1.242 0 0  0 0 0 1 0',
  '1 0 0 0 0  -0.4375 1.4375 0 0 0  0.2625 -0.5625 1.3 0 0  0 0 0 1 0',
  '1 0 0 0 0  0.035 1.532 -0.567 0 0  0.035 -0.51 1.475 0 0  0 0 0 1 0',
];

/** Los filtros `#olo-a11y-daltonismo-1..3`, que pide `html[data-a11y-daltonismo]` en `globals.css`. */
function FiltroDaltonismo() {
  return (
    <svg className="olo-a11y-filtros" aria-hidden="true" focusable="false">
      {MATRICES_DE_DALTONISMO.map((matriz, i) => (
        <filter key={matriz} id={`olo-a11y-daltonismo-${i + 1}`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={matriz} />
        </filter>
      ))}
    </svg>
  );
}

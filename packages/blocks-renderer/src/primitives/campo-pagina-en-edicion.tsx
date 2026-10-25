'use client';

/**
 * Lo que enseña el panel «Page» del editor cuando no hay ningún bloque seleccionado.
 *
 * Puck pinta ahí un campo `title` por defecto que no cambia nada: el título de la
 * pestaña sale de la base de datos y no de la raíz de la página. En su lugar, cada app
 * declara `root.fields` con este campo de solo lectura, que pide elegir un componente.
 * Qué página es lo dice `root.label` (título del panel y miga de pan, donde Puck escribía
 * «Page»). No guarda nada: nunca llama a `onChange`.
 */

import { COLOR_FOCO_CAMPO } from './estilos-de-campos';

interface DatosDePagina {
  /** Cómo se llama lo que se edita cuando no es una página con dirección: «Menú y pie». */
  nombre?: string;
  /** La dirección pública: «/inicio». */
  ruta?: string;
  slug: string;
}

function PaginaEnEdicion({ nombre, ruta, slug }: DatosDePagina) {
  // El nombre ya es el título del panel y la miga de pan (`root.label`): aquí solo se añade el
  // identificador, y solo si dice algo que la dirección no dice ya.
  const slugAparte = !nombre && ruta && ruta.replace(/^\//, '') !== slug;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        color: COLOR_FOCO_CAMPO,
      }}
    >
      {slugAparte && <span style={{ fontSize: '12px', color: '#4b5563' }}>Identificador: {slug}</span>}
      <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.45, color: '#4b5563' }}>
        Elige un componente de la página para ajustar sus opciones.
      </p>
    </div>
  );
}

/** Campo de Puck de solo lectura para `root.fields`. */
export const campoPaginaEnEdicion = (datos: DatosDePagina) => ({
  type: 'custom' as const,
  label: 'Página que editas',
  render: () => <PaginaEnEdicion {...datos} />,
});

/**
 * El enlace de una sección recién creada, dentro del editor.
 *
 * Aparece solo cuando se llega desde «Nueva sección» (`?nueva=1`), y su razón de ser
 * es que crear la sección y **poder enlazarla** son la misma tarea: sin esto habría
 * que reconstruir la dirección a mano a partir del nombre, que es justo la conversión
 * que la persona no tiene por qué saber hacer.
 *
 * Se muestra la ruta relativa (`/bolsa-de-empleo`) pero se copia la absoluta, porque
 * son dos usos distintos: la relativa es la que hay que teclear en el campo «URL» de
 * un enlace del menú, y la absoluta es la que sirve para pegar en un correo. Copiar
 * la relativa dejaría en el portapapeles algo que fuera del portal no lleva a ningún
 * sitio.
 */
'use client';

import { useState } from 'react';

export function AvisoSeccionNueva({ slug }: { slug: string }) {
  const [copiado, setCopiado] = useState(false);

  const ruta = `/${slug}`;

  const copiar = async () => {
    const absoluta = typeof window !== 'undefined' ? `${window.location.origin}${ruta}` : ruta;

    try {
      await navigator.clipboard.writeText(absoluta);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // `navigator.clipboard` necesita contexto seguro y permiso; si falla, la ruta
      // sigue a la vista para copiarla a mano. No se avisa del fallo porque no hay
      // nada que la persona pueda hacer al respecto.
    }
  };

  return (
    <div className="aviso-seccion-nueva">
      <span>
        Página creada. Su dirección es <code>{ruta}</code>
      </span>
      <button type="button" onClick={copiar} className="aviso-seccion-nueva-copiar">
        {copiado ? 'Copiado' : 'Copiar enlace'}
      </button>
      <span className="aviso-seccion-nueva-nota">
        Pega esa dirección en el campo «URL» de un enlace del menú para que se pueda llegar
        a ella. Todavía no muestra nada: llénala y mándala a revisión.
      </span>
    </div>
  );
}

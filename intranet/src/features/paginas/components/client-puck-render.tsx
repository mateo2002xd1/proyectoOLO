'use client';

import { Render, type Data } from '@puckeditor/core';
import { puckConfig } from '@/config/puck.config';
import type { ContenidoPagina } from '../types/editor.types';

/**
 * Pinta el contenido guardado de una página.
 *
 * Aquí se encuentran dos formas del mismo dato: `ContenidoPagina`, que es como lo
 * guarda y devuelve la API, y `Data`, que es lo que Puck espera. La diferencia real
 * es que para nosotros `root` es opcional y para Puck no. La API siempre lo manda,
 * pero rellenarlo aquí evita que un contenido antiguo o incompleto tumbe la página.
 */
export function ClientPuckRender({ data }: { data: ContenidoPagina }) {
  const paraPuck: Data = {
    ...data,
    content: data.content ?? [],
    root: data.root ?? {},
  } as Data;

  return <Render config={puckConfig} data={paraPuck} />;
}

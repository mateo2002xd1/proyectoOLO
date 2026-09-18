'use client';

import { Render, type Data } from '@puckeditor/core';
import { puckConfig } from '@/config/puck.config';
import type { ContenidoPagina } from '../../model/pagina.types';

/**
 * Pinta el contenido guardado de una página.
 *
 * Aquí se encuentran dos formas del mismo dato: `ContenidoPagina`, que es como lo
 * guarda y devuelve la API, y `Data`, que es lo que Puck espera. La diferencia real
 * es que para nosotros `root` es opcional y para Puck no. La API siempre lo manda,
 * pero rellenarlo aquí evita que un contenido antiguo o incompleto tumbe la página.
 *
 * **Seguridad XSS**: el contenido que llega aquí ya fue sanitizado por
 * `sanitizarContenidoPuck()` en el use-case `guardar-borrador` del backend.
 * No usamos `dangerouslySetInnerHTML` directamente. La defensa de segunda capa
 * es la Content-Security-Policy que bloquea scripts inline en el navegador.
 *
 * @see api-backend/src/shared/sanitizar-contenido.ts
 * @see 3-seguridad-del-proyecto.md §S2 (XSS del contenido — CRÍTICO)
 */
export function ClientPuckRender({ data }: { data: ContenidoPagina }) {
  const paraPuck: Data = {
    ...data,
    content: data.content ?? [],
    root: data.root ?? {},
  } as Data;

  return <Render config={puckConfig} data={paraPuck} />;
}


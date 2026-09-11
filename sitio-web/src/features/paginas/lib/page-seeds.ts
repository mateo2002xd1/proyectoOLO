import type { Data } from '@puckeditor/core';
import { homeFallbackData } from './home-fallback-data';
import { plantillaFallbackData } from './plantilla-fallback-data';
import { SLUG_PLANTILLA } from './plantilla';

/**
 * Semillas por slug.
 *
 * Una "semilla" es el contenido estático que se usa para PRE-LLENAR el editor
 * cuando una página todavía no tiene ninguna versión en BD. Así, al abrir
 * "editar inicio" por primera vez, el administrador ve una copia editable de lo
 * que hoy es estático en lugar de un lienzo en blanco.
 *
 * Ciclo de vida:
 *   1. No hay versión en BD  → el editor se siembra con `pageSeeds[slug]`.
 *   2. El admin edita y "Guarda Borrador" → se crea una versión real en BD.
 *   3. A partir de ahí la BD es la fuente de verdad; la semilla ya no se usa.
 *
 * IMPORTANTE: cada semilla debe usar EXACTAMENTE los `type` de bloque
 * registrados en `puck.config.tsx`, o `<Puck>`/`<Render>` no sabrá dibujarla.
 */
export const pageSeeds: Record<string, Data> = {
  inicio: homeFallbackData,
  [SLUG_PLANTILLA]: plantillaFallbackData,
};

/** Página vacía en formato Puck (fallback cuando un slug no tiene semilla). */
const EMPTY_DATA: Data = { content: [], root: {} };

/** Devuelve la semilla del slug, o una página vacía si no hay semilla definida. */
export function getPageSeed(slug: string): Data {
  return pageSeeds[slug] ?? EMPTY_DATA;
}

/**
 * True si el contenido editable llega "vacío" — sin bloques o sin versión.
 * Cubre `null`/`undefined`, arreglos de bloques y el formato `Data` de Puck.
 */
export function isEmptyContent(contenido: unknown): boolean {
  if (!contenido) return true;
  if (Array.isArray(contenido)) return contenido.length === 0;
  const data = contenido as { content?: unknown[] };
  return !Array.isArray(data.content) || data.content.length === 0;
}

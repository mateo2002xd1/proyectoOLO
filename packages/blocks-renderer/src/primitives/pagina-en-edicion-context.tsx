'use client';

import { createContext, useContext } from 'react';

export type SubidaRegistrador = (ruta: string) => Promise<void> | void;

export interface ContextoPaginaEnEdicion {
  slug: string | null;
  registrarSubida?: SubidaRegistrador;
}

export const PaginaEnEdicionContext = createContext<ContextoPaginaEnEdicion | string | null>(null);

/**
 * Devuelve el slug de la página actualmente abierta en el editor Puck.
 * Si el contexto es una cadena o un objeto con `slug`, devuelve el string.
 */
export function usePaginaEnEdicion(): string | null {
  const val = useContext(PaginaEnEdicionContext);
  if (!val) return null;
  if (typeof val === 'string') return val;
  return val.slug ?? null;
}

/**
 * Devuelve la función registradora de subidas pendientes asociada a la página en edición.
 */
export function useRegistrarSubida(): SubidaRegistrador | undefined {
  const val = useContext(PaginaEnEdicionContext);
  if (val && typeof val === 'object' && val.registrarSubida) {
    return val.registrarSubida;
  }
  return undefined;
}

'use client';

import { createContext, useContext } from 'react';

/** Slug de la página abierta en el editor, para que los campos de subida sepan para qué página suben. */
export const PaginaEnEdicionContext = createContext<string | null>(null);

export const usePaginaEnEdicion = () => useContext(PaginaEnEdicionContext);

/** Parámetros de la URL que llevan la consulta: lo que se buscó y la ocupación abierta. */
export const PARAM_BUSCAR = 'buscar';
export const PARAM_OCUPACION = 'ocupacion';

/** La dirección de una consulta: la página de resultados con lo buscado en `?buscar=`. */
export const urlDeBusqueda = (pagina: string, termino: string) =>
  `${pagina}?${PARAM_BUSCAR}=${encodeURIComponent(termino)}`;

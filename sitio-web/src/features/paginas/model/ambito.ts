/**
 * El sitio y la intranet comparten la tabla `paginas` y ambos tienen su `/inicio`.
 * Esta cabecera es lo que le dice a la API a cuál de las dos pertenece cada página.
 *
 * La usan `publicacion/` y `services/`, así que vive en `model/`: las etapas no se
 * importan entre sí (`8-ciclo-editorial.md` §3.2).
 */
export const CABECERAS_DEL_SITIO = { 'X-Ambito': 'sitio' } as const;

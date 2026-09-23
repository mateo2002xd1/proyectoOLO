import axios from 'axios';
import { CABECERAS_DEL_SITIO } from './ambito';
import { URL_DE_LA_API } from '@/shared/lib/url-de-la-api';

/**
 * El cliente HTTP **con sesión** (`withCredentials`) contra la API de páginas.
 *
 * Lo comparten `edicion/`, `revision/` y `secciones/`. Vive en
 * `model/` porque las etapas no se importan entre sí (`8-ciclo-editorial.md` §3.2).
 *
 * **`publicacion/` no debe importarlo nunca** (regla 3 del plan): lo público va por su
 * propio cliente anónimo, en `publicacion/services/publicacion.service.ts`.
 */
export const apiConSesion = axios.create({
  baseURL: URL_DE_LA_API,
  withCredentials: true,
  timeout: 5000,
  headers: CABECERAS_DEL_SITIO,
});

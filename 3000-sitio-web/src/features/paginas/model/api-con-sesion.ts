import axios from 'axios';
import { CABECERAS_DEL_SITIO } from './ambito';

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
  baseURL: '/api/backend',
  withCredentials: true,
  // 15 s y no 5: la cola de revisión y las demás pantallas con sesión encadenan varias
  // consultas a Neon, y con la red lenta pasaban de 5 s sin estar caída la API.
  timeout: 15000,
  headers: CABECERAS_DEL_SITIO,
});

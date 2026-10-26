/**
 * Tercera puerta del módulo, para lo que solo corre en el servidor.
 *
 * `MarcoSecciones` lee la sesión con `next/headers` (`shared/lib/session/sesion.ts`).
 * No puede ir en `index.ts`: esa puerta la importan también componentes de cliente
 * (`app/edit/[slug]/editor-client.tsx`), y con ella el bundle del navegador arrastraría
 * `next/headers` y el build falla ("You're importing a module that depends on
 * next/headers"). Solo la piden Server Components: `app/(pages)/layout.tsx` y
 * `app/preview/[slug]/page.tsx`.
 *
 * @see client.ts
 */

export { MarcoSecciones } from './navegation/marco-secciones';

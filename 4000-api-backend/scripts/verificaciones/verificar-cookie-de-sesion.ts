/**
 * Comprueba que cada app use solo su cookie de sesión al llamar a la API.
 *
 * Existe por el fallo del 2026-10-15: las cookies no se separan por puerto, así que en
 * `localhost` el navegador manda a la API `token` (intranet) y `sitio_token` (sitio web)
 * a la vez. `requireAuth` leía `token ?? sitio_token`, y con una sesión abierta en la
 * intranet el panel del sitio web cargaba los datos **con la cuenta de la intranet**: a
 * una cuenta ya configurada le salía «Termina de configurar tu cuenta…», que era de otra.
 *
 * No toca la base de datos: `tokenDeLaCookie` solo mira las cookies y el `Origin`.
 * Misma convención que `verificar-politica-email.ts`.
 */
import type { Request } from 'express';
import { config } from '../../src/config';
import { tokenDeLaCookie } from '../../src/middlewares/auth.middleware';

let fallos = 0;

/** Imprime OK o FALLA para una comprobación y cuenta los fallos. */
const comprobar = (descripcion: string, obtenido: unknown, esperado: unknown) => {
  const ok = obtenido === esperado;
  if (!ok) fallos += 1;
  console.log(`  ${ok ? 'OK  ' : 'FALLA'}  ${descripcion} → ${String(obtenido)} (esperado ${String(esperado)})`);
};

/** Una petición con lo único que mira `tokenDeLaCookie`. */
const peticion = (origen: string | undefined, cookies: Record<string, string>) =>
  ({ headers: origen ? { origin: origen } : {}, cookies }) as unknown as Request;

const LAS_DOS = { token: 'de-la-intranet', sitio_token: 'del-sitio' };

/** Prueba la elección de cookie con las dos apps abiertas en el mismo navegador. */
const verificar = (): void => {
  console.log('\n=== Las dos sesiones abiertas en el mismo navegador ===');
  comprobar('desde el sitio web usa la del sitio', tokenDeLaCookie(peticion(config.frontendUrl, LAS_DOS)), 'del-sitio');
  comprobar('desde la intranet usa la de la intranet', tokenDeLaCookie(peticion(config.intranetUrl, LAS_DOS)), 'de-la-intranet');

  console.log('\n=== Solo la sesión de la otra app ===');
  // Sin esto, entrar en la intranet abría sesión también en el sitio web, y al revés.
  comprobar('el sitio web no usa la de la intranet', tokenDeLaCookie(peticion(config.frontendUrl, { token: 'de-la-intranet' })), undefined);
  comprobar('la intranet no usa la del sitio', tokenDeLaCookie(peticion(config.intranetUrl, { sitio_token: 'del-sitio' })), undefined);

  console.log('\n=== Cada app con solo la suya ===');
  comprobar('sitio web', tokenDeLaCookie(peticion(config.frontendUrl, { sitio_token: 'del-sitio' })), 'del-sitio');
  comprobar('intranet', tokenDeLaCookie(peticion(config.intranetUrl, { token: 'de-la-intranet' })), 'de-la-intranet');

  console.log('\n=== Sin Origin de una de las dos apps (servidor o herramientas) ===');
  comprobar('sin Origin, el orden de siempre', tokenDeLaCookie(peticion(undefined, LAS_DOS)), 'de-la-intranet');
  comprobar('sin Origin y solo la del sitio', tokenDeLaCookie(peticion(undefined, { sitio_token: 'del-sitio' })), 'del-sitio');
  comprobar('sin cookies', tokenDeLaCookie(peticion(config.frontendUrl, {})), undefined);

  console.log(fallos === 0 ? '\nTodo correcto.\n' : `\n${fallos} comprobaciones fallaron.\n`);
  process.exit(fallos === 0 ? 0 : 1);
};

verificar();

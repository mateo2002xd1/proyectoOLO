/**
 * URL pública del sitio web, para los enlaces que salen de la intranet hacia él.
 *
 * La variable es `NEXT_PUBLIC_SITIO_WEB_URL`, que es la que inyectan los dos
 * `docker-compose`. Antes aquí se leía `NEXT_PUBLIC_SITE_URL`, un nombre que no define
 * nadie —ni el compose, ni el Dockerfile, ni `.env`—, así que esto caía **siempre** al
 * valor por defecto. En desarrollo coincidía y el fallo pasaba inadvertido; en
 * producción el enlace «Regresar al sitio web del Observatorio» mandaba a cada visitante
 * al `localhost` de su propia máquina.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITIO_WEB_URL || 'http://localhost:3000';

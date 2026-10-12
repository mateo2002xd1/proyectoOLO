import { Poppins } from 'next/font/google';

/**
 * `--font-body` apunta a 'Poppins' en globals.css desde siempre, pero nunca se
 * cargaba: el layout raíz solo carga Work Sans vía `next/font`, así que Poppins
 * caía al `sans-serif` del sistema. Un único punto de carga para que el panel de
 * administración y sus pantallas de acceso (`LetraDelPanel`) y los bloques del sitio
 * público que la usan no terminen con dos configuraciones de peso que se desalinean
 * con el tiempo.
 */
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

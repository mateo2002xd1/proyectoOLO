import { Poppins } from 'next/font/google';

/**
 * `--font-body` apunta a 'Poppins' en globals.css desde siempre, pero nunca se
 * cargaba: solo `--font-heading` (Work Sans) se registra vía `next/font` en el
 * layout raíz, así que Poppins caía al `sans-serif` del sistema. Un único punto
 * de carga para que el panel de administración (login y el panel general) no
 * termine con dos configuraciones de peso que se desalinean con el tiempo.
 */
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

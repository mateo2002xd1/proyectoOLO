import { Poppins } from 'next/font/google';

/**
 * `--font-body` apunta a 'Work Sans' en globals.css, pero nunca se carga: el
 * layout raíz solo registra Geist (`--font-geist-sans`), una variable que
 * `globals.css` no referencia en ningún punto. Este módulo carga Poppins de
 * verdad para el flujo de acceso, siguiendo el mismo criterio que sitio-web.
 */
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

import { poppins } from '@/shared/lib/typography/fonts';

/**
 * Pone Poppins en `<body>` mientras el panel o una pantalla de acceso están montados:
 * títulos y texto. La montan `app/admin/layout.tsx` y `app/(auth)/layout.tsx`.
 *
 * Poppins es la de siempre del panel. El 2026-10-09 se probó Inter, la de los mockups, y
 * el usuario la descartó: «Poppins es mejor». Se carga en `shared/lib/typography/fonts.ts`, el único
 * punto donde se declara.
 *
 * - **En `<body>` y no en el contenedor del layout**, porque los modales y los avisos
 *   flotantes salen por portal a `<body>`, fuera de ese contenedor, y no heredarían nada
 *   de él.
 * - **Cambia las dos variables de globals.css y no `font-family`**, para que también quede
 *   en Poppins lo que las pide a mano: los h1–h6, `.admin-header` y `.admin-subtitle` usan
 *   `--font-heading`. Esa variable vale «Open Sans» en el `:root` de globals.css, una letra
 *   que no se carga en ningún lado, así que sin esto los títulos del panel salían en la
 *   del sistema (Arial en Windows).
 * - Al ir a otra ruta (el sitio público, el editor) el layout se desmonta, la etiqueta se
 *   va con él y vuelve la letra de antes.
 *
 * `poppins.style.fontFamily` es el nombre que le da next/font, con su respaldo de medidas
 * ajustadas («Poppins Fallback»), así que no se escribe a mano.
 */
export function LetraDelPanel() {
  const familia = poppins.style.fontFamily;
  return (
    <style
      // Texto fijo, sin nada que venga de quien usa el panel.
      dangerouslySetInnerHTML={{ __html: `body{--font-heading:${familia};--font-body:${familia}}` }}
    />
  );
}

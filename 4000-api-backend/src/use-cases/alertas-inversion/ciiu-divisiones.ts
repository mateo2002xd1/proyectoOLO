/**
 * De un código CIIU a su sección, por la división (los dos primeros dígitos).
 *
 * Cada sección cubre un rango de divisiones (`ciiu_secciones.divisiones`: `'01-03'`,
 * `'35'`), así que ni el Excel de sectores ni el de proyectos necesitan traer la letra.
 * Lo comparten los dos importadores.
 */

/** `'01-03'` → `[1, 3]`; `'35'` → `[35, 35]`. */
function rangoDeDivisiones(divisiones: string): [number, number] {
  const [desde, hasta] = divisiones.split('-').map((n) => Number(n));
  return [desde, hasta ?? desde];
}

export function crearBuscadorDeSeccionPorDivision(
  secciones: { id: string; divisiones: string }[]
): (division: number) => string | null {
  const rangos = secciones.map((s) => ({ id: s.id, rango: rangoDeDivisiones(s.divisiones) }));
  return (division) => rangos.find((r) => division >= r.rango[0] && division <= r.rango[1])?.id ?? null;
}

/**
 * La división de un código escrito como llega de Excel. Un código de 4 dígitos es una
 * clase (`0111`); uno de 3 o menos es un grupo cuyo cero inicial Excel suele comerse
 * (`011` llega como `11`), así que se completa a 3 dígitos antes de tomar los dos
 * primeros. Devuelve `null` si no es numérico o tiene más de 4 dígitos.
 */
export function divisionDeCodigo(codigo: string): number | null {
  if (!/^\d{1,4}$/.test(codigo)) return null;
  const completo = codigo.length === 4 ? codigo : codigo.padStart(3, '0');
  return Number(completo.slice(0, 2));
}

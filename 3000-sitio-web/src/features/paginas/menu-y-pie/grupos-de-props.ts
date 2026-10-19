/**
 * Tarjetas del editor que agrupan props sueltas sin cambiar cómo se guardan.
 *
 * Un campo de Puck solo escribe su propia prop, así que una tarjeta con varias
 * opciones guarda un objeto (`grupoFranjaGov: { … }`). Los componentes y el sitio
 * publicado siguen leyendo las props sueltas de siempre; esto las mantiene al día:
 *
 * - si el grupo no existe (bloque guardado antes de la tarjeta), se arma con las
 *   props sueltas;
 * - después, cada prop suelta se copia de su grupo, que es lo único que edita el panel.
 *
 * Es idempotente: con los dos lados iguales devuelve lo mismo, así que puede ir en un
 * `resolveData` de Puck sin bucles. Lo usan el pie (`campos-del-pie.ts`) y la franja
 * GOV.CO de la cabecera (`puck.config.tsx`).
 */
export function resolverGruposDeProps(
  props: Record<string, any>,
  clavesPorGrupo: Record<string, string[]>
): Record<string, any> {
  const resultado: Record<string, any> = { ...props };
  for (const [grupo, claves] of Object.entries(clavesPorGrupo)) {
    const valores = props[grupo] ?? Object.fromEntries(claves.map((clave) => [clave, props[clave]]));
    resultado[grupo] = valores;
    for (const clave of claves) resultado[clave] = valores[clave];
  }
  return resultado;
}

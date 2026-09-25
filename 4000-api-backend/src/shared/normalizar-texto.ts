/**
 * Forma canónica para comparar textos que llegan escritos a mano en un Excel: nombres
 * de hoja, encabezados y nombres de departamento.
 *
 * Quita tildes, pasa a minúsculas, cambia todo lo que no sea letra o dígito por un
 * espacio y colapsa los espacios: "Guajira, La" → "guajira la", "N.C." → "n c",
 * "Bogotá  D.C. " → "bogota d c".
 *
 * `departamentos_alias.alias_normalizado` está guardado con esta misma regla (ver la
 * migración 032, que la replica en SQL): si cambia aquí, los alias dejan de coincidir.
 */
export function normalizarParaComparar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

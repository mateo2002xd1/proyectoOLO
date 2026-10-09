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
 *
 * Y tiene una gemela en la base, `normalizar_nombre()` (migración 042), sobre la que están
 * los únicos de `departamentos`, `municipios` y `empresas`. Dan lo mismo con cualquier
 * texto en español; con letras de otros alfabetos latinos que la función SQL no lista
 * («ā», «š») la de aquí quita la tilde y la de la base pone un espacio. Cambiar una
 * obliga a cambiar la otra con una migración.
 */
export function normalizarParaComparar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Propone año y periodo a partir del nombre del archivo. El Excel de percentiles no los
 * trae, así que esto solo **sugiere**: rellena los desplegables vacíos y el formulario
 * dice de dónde salió, para que el administrador lo confirme.
 *
 * Tomado de `criterios/analisis-normalizacion-percentiles-ocupacionales.md` §8, donde se
 * probó con: percentiles_2025_T1, "1er trimestre 2019", "2do trimestre 2014",
 * percentiles-2012-3T, "Cuarto Trimestre 2020", "II semestre 2016", "Primer semestre 2021",
 * "anual 2013", "trimestre 4 - 2015" → correctos; "data2.xlsx" y "..._T5" → null.
 * La convención recomendada al equipo de análisis es `percentiles_AAAA_PERIODO.xlsx`.
 */

const ORDINAL: Record<string, number> = {
  '1': 1, '1er': 1, '1ro': 1, i: 1, primer: 1, primero: 1,
  '2': 2, '2do': 2, ii: 2, segundo: 2,
  '3': 3, '3er': 3, '3ro': 3, iii: 3, tercer: 3, tercero: 3,
  '4': 4, '4to': 4, iv: 4, cuarto: 4,
};
const N = '(1er|1ro|2do|3er|3ro|4to|primero?|segundo|tercero?|cuarto|iii|ii|iv|i|[1-4])';

export function detectarCelda(nombreArchivo: string): { anio: number; periodoCodigo: string } | null {
  const texto = nombreArchivo
    .replace(/\.xlsx?$/i, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const anio = texto.match(/\b(20\d{2})\b/)?.[1];
  let periodo: string | null = null;
  if (/\banual\b|\banio completo\b/.test(texto)) periodo = 'ANUAL';

  const trimestre =
    texto.match(new RegExp(`\\b${N} ?(t|trim|trimestre)\\b`)) ??
    texto.match(new RegExp(`\\b(t|trim|trimestre) ?${N}\\b`));
  const semestre =
    texto.match(new RegExp(`\\b${N} ?(s|sem|semestre)\\b`)) ??
    texto.match(new RegExp(`\\b(s|sem|semestre) ?${N}\\b`));
  const numero = (m: RegExpMatchArray) => ORDINAL[m.slice(1).find((g) => g && ORDINAL[g] !== undefined)!];

  if (!periodo && trimestre) {
    const n = numero(trimestre);
    if (n >= 1 && n <= 4) periodo = `T${n}`;
  }
  if (!periodo && semestre) {
    const n = numero(semestre);
    if (n === 1 || n === 2) periodo = `S${n}`;
  }

  return anio && periodo ? { anio: Number(anio), periodoCodigo: periodo } : null;
}

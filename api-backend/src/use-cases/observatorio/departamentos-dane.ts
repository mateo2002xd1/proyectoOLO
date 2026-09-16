/**
 * Los 33 departamentos de Colombia con su código DANE de dos dígitos — mismos
 * códigos que `sitio-web/.../programas-sobresalientes/lib/departamentos-colombia.ts`
 * usa para colorear el mapa. Sin ese código el mapa no puede saber qué
 * departamento tiene datos: por eso la importación del Excel lo resuelve aquí
 * y lo guarda en `departamentos.codigo_dane` (ver `026-observatorio-programas-
 * sobresalientes`, columna nullable — nadie la llenaba antes de esto).
 */
const DEPARTAMENTOS_DANE: { codigoDane: string; nombre: string }[] = [
  { codigoDane: '91', nombre: 'Amazonas' },
  { codigoDane: '05', nombre: 'Antioquia' },
  { codigoDane: '81', nombre: 'Arauca' },
  { codigoDane: '88', nombre: 'Archipiélago de San Andrés, Providencia y Santa Catalina' },
  { codigoDane: '08', nombre: 'Atlántico' },
  { codigoDane: '11', nombre: 'Bogotá, D.C.' },
  { codigoDane: '13', nombre: 'Bolívar' },
  { codigoDane: '15', nombre: 'Boyacá' },
  { codigoDane: '17', nombre: 'Caldas' },
  { codigoDane: '18', nombre: 'Caquetá' },
  { codigoDane: '85', nombre: 'Casanare' },
  { codigoDane: '19', nombre: 'Cauca' },
  { codigoDane: '20', nombre: 'Cesar' },
  { codigoDane: '27', nombre: 'Chocó' },
  { codigoDane: '23', nombre: 'Córdoba' },
  { codigoDane: '25', nombre: 'Cundinamarca' },
  { codigoDane: '94', nombre: 'Guainía' },
  { codigoDane: '95', nombre: 'Guaviare' },
  { codigoDane: '41', nombre: 'Huila' },
  { codigoDane: '44', nombre: 'La Guajira' },
  { codigoDane: '47', nombre: 'Magdalena' },
  { codigoDane: '50', nombre: 'Meta' },
  { codigoDane: '52', nombre: 'Nariño' },
  { codigoDane: '54', nombre: 'Norte de Santander' },
  { codigoDane: '86', nombre: 'Putumayo' },
  { codigoDane: '63', nombre: 'Quindío' },
  { codigoDane: '66', nombre: 'Risaralda' },
  { codigoDane: '68', nombre: 'Santander' },
  { codigoDane: '70', nombre: 'Sucre' },
  { codigoDane: '73', nombre: 'Tolima' },
  { codigoDane: '76', nombre: 'Valle del Cauca' },
  { codigoDane: '97', nombre: 'Vaupés' },
  { codigoDane: '99', nombre: 'Vichada' },
];

const quitarTildes = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
const normalizar = (texto: string) => quitarTildes(texto.trim().toLowerCase());

const CODIGO_POR_NOMBRE = new Map<string, string>();
for (const d of DEPARTAMENTOS_DANE) CODIGO_POR_NOMBRE.set(normalizar(d.nombre), d.codigoDane);

/**
 * El Excel real del SENA no siempre trae el nombre oficial del DANE en
 * "Regional" — estos son los alias verificados contra el archivo real.
 */
const ALIAS_EXCEL: Record<string, string> = {
  'distrito capital': 'bogota, d.c.',
  guajira: 'la guajira',
  'san andres': 'archipielago de san andres, providencia y santa catalina',
  valle: 'valle del cauca',
};
for (const [alias, nombreCanonico] of Object.entries(ALIAS_EXCEL)) {
  const codigo = CODIGO_POR_NOMBRE.get(nombreCanonico);
  if (codigo) CODIGO_POR_NOMBRE.set(alias, codigo);
}

/** `null` si el nombre no calza con ningún departamento ni alias conocido — se guarda
 * sin código antes que inventar uno, y el departamento simplemente no coloreará en el mapa. */
export function resolverCodigoDane(nombreExcel: string): string | null {
  return CODIGO_POR_NOMBRE.get(normalizar(nombreExcel)) ?? null;
}

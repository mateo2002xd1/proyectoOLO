import type { OpcionGrafico } from '@/shared/ui/molecules/grafico-echarts';
import type { DepartamentoConDatos } from '../types';
import { DEPARTAMENTOS_COLOMBIA, VIEWBOX_COLOMBIA } from './departamentos-colombia';

/** Nombre con el que se registra el mapa en ECharts (`echarts.registerMap`). */
export const NOMBRE_DEL_MAPA = 'colombia-departamentos';

/** De menor a mayor tasa de vinculación: verde claro → verde profundo de la marca. */
export const ESCALA_DE_TASA = ['#CFE8A9', '#A7D35E', '#7DB828', '#3F7A0C'] as const;
const COLOR_SIN_DATOS = '#E4E7EC';
const COLOR_TRAZO = '#98A2B3';
const AZUL_DE_MARCA = '#001631';
const LETRA = 'Poppins, sans-serif';
/** Cuántos departamentos llevan etiqueta lateral con línea guía. */
const ETIQUETAS = 4;

export const formatearTasa = (tasa: number) =>
  `${tasa.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

/**
 * El mapa como SVG, que es lo que ECharts registra: cada `<path name="05">` es una región
 * que se identifica por su código DANE (el mismo que usan los filtros y los datos).
 */
export function svgDelMapa(): string {
  const caminos = DEPARTAMENTOS_COLOMBIA.map((d) => `<path name="${d.codigoDane}" d="${d.path}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX_COLOMBIA}">${caminos}</svg>`;
}

/** Color de un departamento según dónde cae su tasa entre la menor y la mayor de las visibles. */
export function colorDeTasa(tasa: number, minima: number, maxima: number): string {
  if (!(maxima > minima)) return ESCALA_DE_TASA[2];
  const tramo = Math.floor(((tasa - minima) / (maxima - minima)) * ESCALA_DE_TASA.length);
  return ESCALA_DE_TASA[Math.min(ESCALA_DE_TASA.length - 1, Math.max(0, tramo))];
}

/**
 * Opción de ECharts del mapa de «Programas + sobresalientes»: los departamentos con registros
 * coloreados por tasa de vinculación, el resto en gris, y los cuatro de mayor tasa con una
 * línea guía hacia una etiqueta a la derecha (la tasa grande y el nombre debajo).
 *
 * Las líneas y las etiquetas viven en las mismas coordenadas del SVG del mapa (800 × 900),
 * más allá de su borde derecho: así escalan con el mapa y no hay que medir píxeles.
 */
export function opcionMapaDepartamentos({
  departamentos,
  codigoSeleccionado,
}: {
  departamentos: DepartamentoConDatos[];
  codigoSeleccionado: string;
}): OpcionGrafico {
  const [, , anchoSvg, altoSvg] = VIEWBOX_COLOMBIA.split(' ').map(Number);
  const conDatos = new Map(departamentos.map((d) => [d.codigoDane, d]));
  const nombres = new Map(DEPARTAMENTOS_COLOMBIA.map((d) => [d.codigoDane, d.nombre]));
  const tasas = departamentos.map((d) => d.tasaVinculacion);
  const minima = Math.min(...tasas);
  const maxima = Math.max(...tasas);
  const hayEleccion = codigoSeleccionado !== 'todos';

  const regiones = DEPARTAMENTOS_COLOMBIA.map((geo) => {
    const datos = conDatos.get(geo.codigoDane);
    if (!datos) {
      return { name: geo.codigoDane, itemStyle: { areaColor: COLOR_SIN_DATOS }, emphasis: { itemStyle: { areaColor: COLOR_SIN_DATOS } } };
    }
    const elegido = codigoSeleccionado === geo.codigoDane;
    const color = colorDeTasa(datos.tasaVinculacion, minima, maxima);
    return {
      name: geo.codigoDane,
      itemStyle: {
        areaColor: color,
        borderColor: elegido ? AZUL_DE_MARCA : '#ffffff',
        borderWidth: elegido ? 2.5 : 1,
        opacity: hayEleccion && !elegido ? 0.45 : 1,
      },
      emphasis: { itemStyle: { areaColor: color, borderColor: AZUL_DE_MARCA, borderWidth: 2, opacity: 1 } },
    };
  });

  // Los de mayor tasa, y de arriba abajo según donde caen en el mapa para que las líneas no se crucen.
  const principales = [...departamentos]
    .sort((a, b) => b.tasaVinculacion - a.tasaVinculacion || a.nombre.localeCompare(b.nombre, 'es'))
    .slice(0, ETIQUETAS)
    .map((d) => ({ d, centro: DEPARTAMENTOS_COLOMBIA.find((g) => g.codigoDane === d.codigoDane)?.centroide ?? [0, 0] }))
    .sort((a, b) => a.centro[1] - b.centro[1])
    .map((p, i, todos) => ({
      ...p,
      color: colorDeTasa(p.d.tasaVinculacion, minima, maxima),
      y: (altoSvg * (i + 0.5)) / todos.length,
    }));

  const xCodo = anchoSvg * 0.98;
  const xPunto = anchoSvg * 1.06;

  return {
    animationDuration: 400,
    tooltip: {
      trigger: 'item',
      confine: true,
      formatter: (parametros: unknown) => {
        const { seriesType, name = '' } = parametros as { seriesType?: string; name?: string };
        if (seriesType !== 'map') return '';
        const nombre = nombres.get(name) ?? name;
        const datos = conDatos.get(name);
        if (!datos) return `<b>${nombre}</b><br/>Sin registros de formación`;
        return `<b>${nombre}</b><br/>Tasa de vinculación: ${formatearTasa(datos.tasaVinculacion)}<br/>Egresados: ${datos.egresados.toLocaleString('es-CO')}`;
      },
    },
    geo: {
      map: NOMBRE_DEL_MAPA,
      roam: false,
      left: 0,
      top: '2%',
      bottom: '2%',
      width: '58%',
      label: { show: false },
      itemStyle: { areaColor: COLOR_SIN_DATOS, borderColor: '#ffffff', borderWidth: 1 },
      regions: regiones,
    },
    series: [
      {
        type: 'map',
        geoIndex: 0,
        data: DEPARTAMENTOS_COLOMBIA.map((g) => ({ name: g.codigoDane, value: conDatos.get(g.codigoDane)?.tasaVinculacion ?? NaN })),
      },
      {
        type: 'lines',
        coordinateSystem: 'geo',
        polyline: true,
        silent: true,
        z: 4,
        lineStyle: { color: COLOR_TRAZO, width: 1.2 },
        data: principales.map((p) => ({ coords: [p.centro, [xCodo, p.y], [xPunto, p.y]] })),
      },
      {
        type: 'scatter',
        coordinateSystem: 'geo',
        silent: true,
        z: 5,
        symbolSize: 6,
        itemStyle: { color: COLOR_TRAZO },
        data: principales.map((p) => ({ value: p.centro })),
      },
      {
        type: 'scatter',
        coordinateSystem: 'geo',
        silent: true,
        z: 5,
        symbolSize: 11,
        data: principales.map((p) => ({
          value: [xPunto, p.y],
          itemStyle: { color: p.color },
          label: {
            show: true,
            position: 'right',
            distance: 8,
            align: 'left',
            formatter: `{tasa|${formatearTasa(p.d.tasaVinculacion)}}\n{nombre|${p.d.nombre}}`,
            rich: {
              tasa: { fontFamily: LETRA, fontSize: 20, fontWeight: 700, color: AZUL_DE_MARCA, lineHeight: 28 },
              nombre: { fontFamily: LETRA, fontSize: 12, color: '#667085', lineHeight: 18 },
            },
          },
        })),
      },
    ],
  };
}

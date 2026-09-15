'use client';

import { useCallback, useMemo, useState } from 'react';
import { PROGRAMAS_POR_DEPARTAMENTO } from '../lib/programas-sobresalientes-temporal';
import { aplanarProgramas, filtrarProgramas } from '../lib/filtrar-programas';
import type { FiltrosFormacion } from '../types';

const FILTROS_INICIALES: FiltrosFormacion = {
  codigoDane: 'todos',
  centro: 'todos',
  nivelFormacion: 'todos',
  sexo: 'todos',
  programa: 'todos',
};

/** Sexo es un conjunto cerrado (`ENUM ('M','F')` en el esquema real): no depende de qué haya en el fixture. */
const SEXOS = ['M', 'F'];

/** Filas por página en la tabla de resultados. */
const TAMANIO_PAGINA = 6;

/**
 * Estado del panel de indicadores de formación por departamento.
 *
 * Todo es síncrono y en memoria: no hay `service` porque no hay API que
 * consultar (el esquema `formacion_indicadores` aún no existe en Postgres,
 * ver `lib/programas-sobresalientes-temporal.ts`). El filtrado se recalcula
 * con `useMemo` en vez de guardarse en estado para que los filtros
 * —departamento (mapa), centro, nivel de formación, sexo y programa— nunca
 * queden desincronizados entre sí.
 */
export function useProgramasSobresalientes() {
  const [filtros, setFiltros] = useState<FiltrosFormacion>(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(1);
  /** Detecta un cambio de filtros durante el render, sin useEffect, para volver a la página 1. */
  const [filtrosAnteriores, setFiltrosAnteriores] = useState(filtros);
  if (filtrosAnteriores !== filtros) {
    setFiltrosAnteriores(filtros);
    setPagina(1);
  }

  const todosLosRegistros = useMemo(() => aplanarProgramas(PROGRAMAS_POR_DEPARTAMENTO), []);

  const departamentosConDatos = useMemo(
    () =>
      PROGRAMAS_POR_DEPARTAMENTO.map((departamento) => ({
        codigoDane: departamento.codigoDane,
        nombre: departamento.nombre,
      })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    [],
  );

  /** Registros del departamento activo (o de todos, si no hay ninguno elegido en el mapa). */
  const registrosDelDepartamento = useMemo(() => {
    if (filtros.codigoDane === 'todos') return todosLosRegistros;
    return todosLosRegistros.filter((registro) => registro.codigoDane === filtros.codigoDane);
  }, [todosLosRegistros, filtros.codigoDane]);

  /** Cada select solo ofrece valores presentes en el departamento activo, para no llevar a un resultado vacío. */
  const centrosDisponibles = useMemo(
    () => Array.from(new Set(registrosDelDepartamento.map((r) => r.centro))).sort((a, b) => a.localeCompare(b, 'es')),
    [registrosDelDepartamento],
  );

  const nivelesDisponibles = useMemo(
    () => Array.from(new Set(registrosDelDepartamento.map((r) => r.nivelFormacion))).sort(),
    [registrosDelDepartamento],
  );

  const programasDisponibles = useMemo(
    () =>
      Array.from(new Set(registrosDelDepartamento.map((r) => r.programa))).sort((a, b) => a.localeCompare(b, 'es')),
    [registrosDelDepartamento],
  );

  const resultados = useMemo(
    () => filtrarProgramas(todosLosRegistros, filtros),
    [todosLosRegistros, filtros],
  );

  const totalPaginas = Math.max(1, Math.ceil(resultados.length / TAMANIO_PAGINA));

  const resultadosPagina = useMemo(
    () => resultados.slice((pagina - 1) * TAMANIO_PAGINA, pagina * TAMANIO_PAGINA),
    [resultados, pagina],
  );

  const irAPagina = useCallback(
    (siguiente: number) => {
      setPagina(Math.min(Math.max(1, siguiente), totalPaginas));
    },
    [totalPaginas],
  );

  /** Cambiar de departamento reinicia el resto de filtros: podían no pertenecerle. */
  const seleccionarDepartamento = useCallback((codigoDane: string) => {
    setFiltros((actual) => ({
      ...actual,
      codigoDane,
      centro: 'todos',
      nivelFormacion: 'todos',
      programa: 'todos',
    }));
  }, []);

  const seleccionarCentro = useCallback((centro: string) => {
    setFiltros((actual) => ({ ...actual, centro }));
  }, []);

  const seleccionarNivelFormacion = useCallback((nivelFormacion: string) => {
    setFiltros((actual) => ({ ...actual, nivelFormacion }));
  }, []);

  const seleccionarSexo = useCallback((sexo: string) => {
    setFiltros((actual) => ({ ...actual, sexo }));
  }, []);

  const seleccionarPrograma = useCallback((programa: string) => {
    setFiltros((actual) => ({ ...actual, programa }));
  }, []);

  const limpiarFiltros = useCallback(() => setFiltros(FILTROS_INICIALES), []);

  return {
    filtros,
    departamentosConDatos,
    centrosDisponibles,
    nivelesDisponibles,
    sexos: SEXOS,
    programasDisponibles,
    resultados: resultadosPagina,
    totalResultados: resultados.length,
    pagina,
    totalPaginas,
    irAPagina,
    seleccionarDepartamento,
    seleccionarCentro,
    seleccionarNivelFormacion,
    seleccionarSexo,
    seleccionarPrograma,
    limpiarFiltros,
  };
}

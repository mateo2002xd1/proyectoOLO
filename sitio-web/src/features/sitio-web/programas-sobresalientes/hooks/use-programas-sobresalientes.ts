'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { obtenerProgramasSobresalientesActual } from '../services/programas-sobresalientes.service';
import { filtrarProgramas } from '../lib/filtrar-programas';
import type { DepartamentoConDatos, FiltrosFormacion, RegistroConDepartamento } from '../types';

const FILTROS_INICIALES: FiltrosFormacion = {
  codigoDane: 'todos',
  nivelFormacion: 'todos',
  sexo: 'todos',
  programa: 'todos',
};

/** Sexo es un conjunto cerrado (`CHECK IN ('M','F')` en el esquema real). */
const SEXOS = ['M', 'F'];

/** Filas por página en la tabla de resultados. */
const TAMANIO_PAGINA = 6;

/**
 * Estado del panel de indicadores de formación por departamento.
 *
 * Los datos vienen de `GET /api/observatorio/programas-sobresalientes` (la tabla
 * `programas_sobresalientes` completa — cada carga la vacía y recarga entera, así
 * que esto siempre refleja la última que terminó bien) — ya no del fixture
 * estático. El filtrado se
 * recalcula con `useMemo` en vez de guardarse en estado para que los filtros
 * —departamento (mapa), nivel de formación, sexo y programa— nunca queden
 * desincronizados entre sí.
 */
export function useProgramasSobresalientes() {
  const [filtros, setFiltros] = useState<FiltrosFormacion>(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(1);
  const [todosLosRegistros, setTodosLosRegistros] = useState<RegistroConDepartamento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sin `setCargando(true)` al entrar: el estado ya nace en `true` y este efecto corre
  // una sola vez (`[]`), así que ponerlo de nuevo era un render de más por nada.
  useEffect(() => {
    let cancelado = false;
    obtenerProgramasSobresalientesActual()
      .then((registros) => {
        if (!cancelado) setTodosLosRegistros(registros);
      })
      .catch(() => {
        if (!cancelado) setError('No se pudieron cargar los datos. Intenta de nuevo más tarde.');
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  /** Detecta un cambio de filtros durante el render, sin useEffect, para volver a la página 1. */
  const [filtrosAnteriores, setFiltrosAnteriores] = useState(filtros);
  if (filtrosAnteriores !== filtros) {
    setFiltrosAnteriores(filtros);
    setPagina(1);
  }

  const departamentosConDatos = useMemo<DepartamentoConDatos[]>(() => {
    const vistos = new Map<string, string>();
    for (const registro of todosLosRegistros) {
      if (!vistos.has(registro.codigoDane)) vistos.set(registro.codigoDane, registro.departamento);
    }
    return Array.from(vistos, ([codigoDane, nombre]) => ({ codigoDane, nombre })).sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es'),
    );
  }, [todosLosRegistros]);

  /** Registros del departamento activo (o de todos, si no hay ninguno elegido en el mapa). */
  const registrosDelDepartamento = useMemo(() => {
    if (filtros.codigoDane === 'todos') return todosLosRegistros;
    return todosLosRegistros.filter((registro) => registro.codigoDane === filtros.codigoDane);
  }, [todosLosRegistros, filtros.codigoDane]);

  /** Cada select solo ofrece valores presentes en el departamento activo, para no llevar a un resultado vacío. */
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
      nivelFormacion: 'todos',
      programa: 'todos',
    }));
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

  const limpiarFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIALES);
  }, []);

  const hayFiltrosActivos = useMemo(
    () =>
      filtros.codigoDane !== 'todos' ||
      filtros.nivelFormacion !== 'todos' ||
      filtros.sexo !== 'todos' ||
      filtros.programa !== 'todos',
    [filtros],
  );

  return {
    filtros,
    cargando,
    error,
    departamentosConDatos,
    nivelesDisponibles,
    sexos: SEXOS,
    programasDisponibles,
    resultados: resultadosPagina,
    totalResultados: resultados.length,
    pagina,
    totalPaginas,
    irAPagina,
    seleccionarDepartamento,
    seleccionarNivelFormacion,
    seleccionarSexo,
    seleccionarPrograma,
    limpiarFiltros,
    hayFiltrosActivos,
  };
}

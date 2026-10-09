'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  obtenerGraficoAlertasInversion,
  obtenerListadoAlertasInversion,
  obtenerOpcionesAlertasInversion,
} from '../services/alertas-inversion.service';
import type { ListadoPublico, OpcionesAlertasInversion, SeccionConCantidad } from '../types';

const POR_PAGINA = 10;

/** Estado de la vista pública: el gráfico por sector, sus filtros y el listado paginado que lo acompaña. */
export function useAlertasInversion() {
  const [opciones, setOpciones] = useState<OpcionesAlertasInversion>({ secciones: [], anios: [], departamentos: [] });
  const [grafico, setGrafico] = useState<SeccionConCantidad[]>([]);
  const [listado, setListado] = useState<ListadoPublico>({
    proyectos: [], total: 0, pagina: 1, porPagina: POR_PAGINA, totalPaginas: 1,
  });
  const [departamento, setDepartamento] = useState('');
  const [anio, setAnio] = useState('');
  const [seccion, setSeccion] = useState('');
  const [pagina, setPagina] = useState(1);
  const [cargandoGrafico, setCargandoGrafico] = useState(true);
  const [cargandoListado, setCargandoListado] = useState(true);
  const [primeraCarga, setPrimeraCarga] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void obtenerOpcionesAlertasInversion()
      // Una API anterior a los filtros por departamento no manda la lista: se tolera vacía.
      .then((datos) => setOpciones({ ...datos, departamentos: datos.departamentos ?? [] }))
      .catch(() => undefined);
  }, []);

  // El gráfico solo depende de departamento y año; el listado, además, del sector y la
  // página. Cada uno tiene su efecto: pasar de página o elegir un sector ya no vuelve a
  // pedir (ni a redibujar) el gráfico. La bandera `cancelado` descarta una respuesta vieja
  // que llega después de otra más reciente.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let cancelado = false;
    setCargandoGrafico(true);
    setError(null);
    obtenerGraficoAlertasInversion({ departamento, anio })
      .then((datos) => !cancelado && setGrafico(datos))
      .catch(() => !cancelado && setError('No se pudieron cargar los datos de alertas de inversión.'))
      .finally(() => !cancelado && setCargandoGrafico(false));
    return () => {
      cancelado = true;
    };
  }, [departamento, anio]);

  useEffect(() => {
    let cancelado = false;
    setCargandoListado(true);
    obtenerListadoAlertasInversion({ seccion, departamento, anio, pagina, porPagina: POR_PAGINA })
      .then((datos) => !cancelado && setListado(datos))
      .catch(() => !cancelado && setError('No se pudieron cargar los datos de alertas de inversión.'))
      .finally(() => !cancelado && setCargandoListado(false));
    return () => {
      cancelado = true;
    };
  }, [seccion, departamento, anio, pagina]);

  const consultando = cargandoGrafico || cargandoListado;
  useEffect(() => {
    if (!consultando) setPrimeraCarga(false);
  }, [consultando]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /** Primera carga: todavía no hay nada que mostrar. Después, los datos anteriores se quedan a la vista. */
  const cargando = primeraCarga;
  const actualizando = !primeraCarga && consultando;

  const seleccionarSector = useCallback((letra: string) => {
    setSeccion((actual) => (actual === letra ? '' : letra));
    setPagina(1);
  }, []);

  const seleccionarDepartamento = useCallback((valor: string) => {
    setDepartamento(valor);
    setPagina(1);
  }, []);

  const seleccionarAnio = useCallback((valor: string) => {
    setAnio(valor);
    setPagina(1);
  }, []);

  return {
    opciones,
    grafico,
    listado,
    anio,
    departamento,
    seccion,
    pagina,
    cargando,
    actualizando,
    error,
    seleccionarSector,
    seleccionarDepartamento,
    seleccionarAnio,
    irAPagina: setPagina,
  };
}

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
  const [opciones, setOpciones] = useState<OpcionesAlertasInversion>({ secciones: [], anios: [] });
  const [grafico, setGrafico] = useState<SeccionConCantidad[]>([]);
  const [listado, setListado] = useState<ListadoPublico>({
    proyectos: [], total: 0, pagina: 1, porPagina: POR_PAGINA, totalPaginas: 1,
  });
  const [anio, setAnio] = useState('');
  const [seccion, setSeccion] = useState('');
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void obtenerOpcionesAlertasInversion()
      .then(setOpciones)
      .catch(() => undefined);
  }, []);

  const refrescar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [datosGrafico, datosListado] = await Promise.all([
        obtenerGraficoAlertasInversion(anio),
        obtenerListadoAlertasInversion({ seccion, anio, pagina, porPagina: POR_PAGINA }),
      ]);
      setGrafico(datosGrafico);
      setListado(datosListado);
    } catch {
      setError('No se pudieron cargar los datos de alertas de inversión.');
    } finally {
      setCargando(false);
    }
  }, [anio, seccion, pagina]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refrescar();
  }, [refrescar]);

  const seleccionarSector = useCallback((letra: string) => {
    setSeccion((actual) => (actual === letra ? '' : letra));
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
    seccion,
    pagina,
    cargando,
    error,
    seleccionarSector,
    seleccionarAnio,
    irAPagina: setPagina,
  };
}

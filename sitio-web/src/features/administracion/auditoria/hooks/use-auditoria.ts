'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  listarAuditoria,
  listarUsuariosDeFiltro,
  MAX_POR_PAGINA,
  type UsuarioDeFiltro,
} from '../services/auditoria.service';
import {
  FILTROS_VACIOS,
  type FiltrosAuditoria,
  type RegistroAuditoria,
  type RespuestaAuditoria,
} from '../types';

const POR_PAGINA_INICIAL = 15;

/**
 * Tope de la exportación: 20 páginas de 200 filas.
 *
 * La alternativa era un endpoint que devolviera la tabla entera, y esa tabla es la
 * que más crece del sistema. Si el filtro no cabe, el CSV avisa de que está
 * recortado en vez de mentir por omisión.
 */
const MAX_PAGINAS_EXPORTACION = 20;

export function useAuditoria() {
  const [filtros, setFiltros] = useState<FiltrosAuditoria>(FILTROS_VACIOS);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(POR_PAGINA_INICIAL);
  const [datos, setDatos] = useState<RespuestaAuditoria | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioDeFiltro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Se descarta la respuesta si el componente se desmonta o si los filtros
  // cambian antes de que llegue: sin esto, una consulta lenta puede pisar el
  // resultado de otra más nueva.
  useEffect(() => {
    let cancelado = false;

    (async () => {
      setIsLoading(true);
      try {
        const data = await listarAuditoria(filtros, pagina, porPagina);
        if (cancelado) return;
        setDatos(data);
        setError(null);
      } catch (err) {
        if (cancelado) return;
        setError(err instanceof Error ? err.message : 'Error al cargar la bitácora');
        setDatos(null);
      } finally {
        if (!cancelado) setIsLoading(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [filtros, pagina, porPagina]);

  useEffect(() => {
    let cancelado = false;
    listarUsuariosDeFiltro().then((lista) => {
      if (!cancelado) setUsuarios(lista);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  const cambiarFiltro = useCallback((campo: keyof FiltrosAuditoria, valor: string) => {
    setFiltros((previos) => ({ ...previos, [campo]: valor }));
    // Filtrar desde la página 7 dejaría una lista vacía que parece "no hay nada".
    setPagina(1);
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros(FILTROS_VACIOS);
    setPagina(1);
  }, []);

  const irAPagina = useCallback(
    (destino: number) => setPagina(Math.max(1, Math.min(destino, datos?.totalPaginas ?? 1))),
    [datos?.totalPaginas],
  );

  const cambiarPorPagina = useCallback((nuevo: number) => {
    setPorPagina(nuevo);
    // Igual que al filtrar: en la página 5 de 25, cambiar a 100 por página puede
    // dejar una página que ya no existe.
    setPagina(1);
  }, []);

  /** Devuelve todo lo que cumple el filtro actual, no solo la página visible. */
  const obtenerParaExportar = useCallback(async (): Promise<{
    registros: RegistroAuditoria[];
    truncado: boolean;
  }> => {
    const registros: RegistroAuditoria[] = [];

    for (let p = 1; p <= MAX_PAGINAS_EXPORTACION; p++) {
      const lote = await listarAuditoria(filtros, p, MAX_POR_PAGINA);
      registros.push(...lote.registros);
      if (p >= lote.totalPaginas) return { registros, truncado: false };
    }

    return { registros, truncado: true };
  }, [filtros]);

  const hayFiltros = Object.values(filtros).some(Boolean);

  return {
    registros: datos?.registros ?? [],
    total: datos?.total ?? 0,
    pagina: datos?.pagina ?? pagina,
    totalPaginas: datos?.totalPaginas ?? 1,
    porPagina: datos?.porPagina ?? porPagina,
    usuarios,
    filtros,
    hayFiltros,
    isLoading,
    error,
    cambiarFiltro,
    limpiarFiltros,
    irAPagina,
    cambiarPorPagina,
    obtenerParaExportar,
  };
}

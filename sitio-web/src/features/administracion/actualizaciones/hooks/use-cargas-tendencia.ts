'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { mensajeDeErrorApi } from '@/shared/lib/errores-api';
import {
  despublicarCorteTendencia,
  eliminarCargaTendencia,
  listarCargasTendencia,
  obtenerCargaTendencia,
  obtenerEstadoTendencia,
  publicarCortesTendencia,
  subirExcelTendencia,
} from '../services/observatorio.service';
import type {
  CargaTendencia,
  CeldaTendencia,
  FiltroHistorialTendencia,
  HistorialTendencia,
} from '../types';

const INTERVALO_SONDEO_MS = 1000;
const CARGAS_POR_PAGINA = 10;

/**
 * Estado de la tarjeta "Criterios de clasificación de resultados": la matriz año ×
 * periodo (para saber qué tiene ya cada celda), el historial filtrable, la subida en
 * curso con su sondeo hasta que el worker termine, y publicar/despublicar cortes.
 *
 * Todo lo que cambia datos sube `version`, y la matriz y el historial se vuelven a pedir.
 */
export function useCargasTendencia() {
  const [version, setVersion] = useState(0);
  const refrescar = useCallback(() => setVersion((v) => v + 1), []);

  const [celdas, setCeldas] = useState<CeldaTendencia[] | null>(null);
  const [errorEstado, setErrorEstado] = useState<string | null>(null);

  const [filtro, setFiltro] = useState<FiltroHistorialTendencia>({ anio: '', periodo: '' });
  const [pagina, setPagina] = useState(1);
  const [historial, setHistorial] = useState<HistorialTendencia | null>(null);
  const [errorHistorial, setErrorHistorial] = useState<string | null>(null);

  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);
  const [cargaEnProceso, setCargaEnProceso] = useState<CargaTendencia | null>(null);
  /** La última carga que terminó en esta sesión: su resultado se muestra bajo el formulario. */
  const [ultimaCarga, setUltimaCarga] = useState<CargaTendencia | null>(null);

  /** Cortes con una publicación o despublicación en curso. */
  const [cortesEnAccion, setCortesEnAccion] = useState<number[]>([]);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  /** Carga que se está eliminando, y lo que dijo la API de la última que se eliminó. */
  const [cargaEnEliminacion, setCargaEnEliminacion] = useState<string | null>(null);
  const [avisoEliminacion, setAvisoEliminacion] = useState<string | null>(null);

  const sondeo = useRef<ReturnType<typeof setInterval> | null>(null);
  const yaSeReanudo = useRef(false);

  const detenerSondeo = () => {
    if (sondeo.current) clearInterval(sondeo.current);
    sondeo.current = null;
  };

  /** Pregunta cada segundo por la carga hasta que el worker la resuelva. */
  const sondear = useCallback(
    (cargaId: string) => {
      detenerSondeo();
      sondeo.current = setInterval(async () => {
        try {
          const actualizada = await obtenerCargaTendencia(cargaId);
          if (actualizada.estado === 'procesando') {
            setCargaEnProceso(actualizada);
            return;
          }
          detenerSondeo();
          setCargaEnProceso(null);
          setUltimaCarga(actualizada);
          refrescar();
        } catch {
          detenerSondeo();
          setCargaEnProceso(null);
          refrescar();
        }
      }, INTERVALO_SONDEO_MS);
    },
    [refrescar]
  );

  useEffect(() => detenerSondeo, []);

  useEffect(() => {
    let vigente = true;
    obtenerEstadoTendencia()
      .then((nuevas) => {
        if (!vigente) return;
        setCeldas(nuevas);
        setErrorEstado(null);
      })
      .catch((error) => {
        if (vigente) setErrorEstado(mensajeDeErrorApi(error, 'No se pudo consultar el estado de las cargas.'));
      });
    return () => {
      vigente = false;
    };
  }, [version]);

  useEffect(() => {
    let vigente = true;
    listarCargasTendencia(filtro, pagina, CARGAS_POR_PAGINA)
      .then((nuevo) => {
        if (!vigente) return;
        // Al eliminar la única fila de la última página, esa página deja de existir.
        if (nuevo.cargas.length === 0 && nuevo.total > 0 && pagina > nuevo.totalPaginas) {
          setPagina(nuevo.totalPaginas);
          return;
        }
        setHistorial(nuevo);
        setErrorHistorial(null);
        // Si al abrir la página ya había una carga en curso (se recargó a mitad), se
        // retoma su progreso en vez de dejarla congelada en el porcentaje de la lista.
        if (!yaSeReanudo.current) {
          yaSeReanudo.current = true;
          const enCurso = nuevo.cargas.find((c) => c.estado === 'procesando');
          if (enCurso && !sondeo.current) {
            setCargaEnProceso(enCurso);
            sondear(enCurso.id);
          }
        }
      })
      .catch((error) => {
        if (vigente) setErrorHistorial(mensajeDeErrorApi(error, 'No se pudo cargar el historial.'));
      });
    return () => {
      vigente = false;
    };
  }, [filtro, pagina, version, sondear]);

  const cambiarFiltro = (cambios: Partial<FiltroHistorialTendencia>) => {
    setFiltro((actual) => ({ ...actual, ...cambios }));
    setPagina(1);
  };

  const subir = async (archivo: File, celda: { anio: string; periodo: string }) => {
    setSubiendo(true);
    setErrorSubida(null);
    setUltimaCarga(null);
    try {
      const { cargaId } = await subirExcelTendencia(archivo, celda);
      const recienSubida = await obtenerCargaTendencia(cargaId);
      setCargaEnProceso(recienSubida);
      refrescar();
      sondear(cargaId);
      return true;
    } catch (error) {
      setErrorSubida(mensajeDeErrorApi(error, 'No se pudo subir el archivo.'));
      return false;
    } finally {
      setSubiendo(false);
    }
  };

  const cambiarPublicacion = async (corteIds: number[], publicar: boolean) => {
    setCortesEnAccion(corteIds);
    setErrorAccion(null);
    try {
      // La API publica varios de una vez; despublicar es de a uno.
      if (publicar) await publicarCortesTendencia(corteIds);
      else await despublicarCorteTendencia(corteIds[0]);
      refrescar();
    } catch (error) {
      setErrorAccion(
        mensajeDeErrorApi(error, publicar ? 'No se pudo publicar el corte.' : 'No se pudo despublicar el corte.')
      );
    } finally {
      setCortesEnAccion([]);
    }
  };

  const eliminar = async (carga: CargaTendencia) => {
    setCargaEnEliminacion(carga.id);
    setErrorAccion(null);
    setAvisoEliminacion(null);
    try {
      const { datosEliminados, archivoEliminado } = await eliminarCargaTendencia(carga.id);
      if (cargaEnProceso?.id === carga.id) {
        detenerSondeo();
        setCargaEnProceso(null);
      }
      if (ultimaCarga?.id === carga.id) setUltimaCarga(null);

      // Una frase con lo que se fue («la carga, sus datos y su archivo») y solo lo que
      // sorprendería: que el sitio dejó de mostrarlo, o que el archivo se quedó.
      const borrado = ['la carga', datosEliminados && 'sus datos', archivoEliminado && 'su archivo'].filter(
        (parte): parte is string => Boolean(parte)
      );
      const enumeracion =
        borrado.length > 1 ? `${borrado.slice(0, -1).join(', ')} y ${borrado[borrado.length - 1]}` : borrado[0];
      setAvisoEliminacion(
        `${carga.anio} · ${carga.periodoNombre}: se eliminó ${enumeracion}.` +
          (datosEliminados?.estabaPublicado ? ' Ya no se ve en el sitio.' : '') +
          (archivoEliminado ? '' : ' El archivo se conservó: lo usa otra carga.')
      );
      refrescar();
    } catch (error) {
      setErrorAccion(mensajeDeErrorApi(error, 'No se pudo eliminar la carga.'));
    } finally {
      setCargaEnEliminacion(null);
    }
  };

  return {
    celdas,
    errorEstado,
    filtro,
    cambiarFiltro,
    pagina,
    setPagina,
    historial,
    errorHistorial,
    subiendo,
    errorSubida,
    cargaEnProceso,
    ultimaCarga,
    subir,
    publicar: (...corteIds: number[]) => cambiarPublicacion(corteIds, true),
    despublicar: (corteId: number) => cambiarPublicacion([corteId], false),
    cortesEnAccion,
    errorAccion,
    eliminar,
    cargaEnEliminacion,
    avisoEliminacion,
  };
}

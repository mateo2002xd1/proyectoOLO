'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  TITULOS_TENDENCIA,
  SUBTITULOS_TENDENCIA,
} from '../data/base-tendencia-datos';
import { obtenerTendenciaOcupacionalActual } from '../services/tendencia-ocupacional.service';
import { FiltrosTendencia } from './filtros-tendencia';
import { DefinicionesNivelOcupacional } from './definiciones-nivel-ocupacional';
import { TablaTendencia } from './tabla-tendencia';
import type {
  DefinicionNivel,
  FiltrosTendencia as IFiltrosTendencia,
  RegistroTendenciaOcupacional,
  TendenciaOcupacionalViewProps,
  TipoTendenciaOcupacional,
} from '../types';

const FILAS_POR_PAGINA = 20;

function renderizarTituloConResalte(texto: unknown): React.ReactNode {
  if (typeof texto !== 'string') {
    return (texto as React.ReactNode) ?? null;
  }
  if (!texto) return null;

  const partes = texto.split(/(\bmás\b|\bmenos\b)/gi);
  return partes.map((parte, i) => {
    const min = parte.toLowerCase();
    if (min === 'más' || min === 'menos') {
      return (
        <span key={i} className="text-[#39a900] font-bold">
          {parte}
        </span>
      );
    }
    return parte;
  });
}

export function TendenciaOcupacionalView({
  tipoTendencia = 'mas-menos',
  mostrarDefiniciones = true,
  mostrarTitulo = true,
  titulo,
  alineacionTitulo = 'centro',
  colorTitulo,
  mostrarSubtitulo = false,
  subtitulo = '',
  alineacionSubtitulo = 'centro',
  colorSubtitulo,
  mostrarDescripcion = false,
  descripcion = '',
  alineacionDescripcion = 'centro',
  colorDescripcion,
  ocultarEncabezado = false,
}: TendenciaOcupacionalViewProps = {}) {
  const [datos, setDatos] = useState<RegistroTendenciaOcupacional[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState<IFiltrosTendencia>({
    departamento: 'Nacional',
    anio: 'todos',
    periodo: 'todos',
    nivelOcupacional: 'todos',
  });

  const [pagina, setPagina] = useState(1);

  const tipoSeguro: TipoTendenciaOcupacional =
    tipoTendencia && TITULOS_TENDENCIA[tipoTendencia] ? tipoTendencia : 'mas-menos';

  const tituloPorDefecto = TITULOS_TENDENCIA[tipoSeguro];

  const tituloEfectivo =
    typeof titulo === 'string' && titulo.trim() !== ''
      ? titulo
      : (titulo || tituloPorDefecto);

  const subtituloEfectivo =
    typeof subtitulo === 'string' && subtitulo.trim() !== ''
      ? subtitulo
      : '';

  const descripcionEfectiva =
    typeof descripcion === 'string' && descripcion.trim() !== ''
      ? descripcion
      : '';

  // Carga dinámica del archivo Excel según el cuadrante/tipo seleccionado
  useEffect(() => {
    let montado = true;
    setCargando(true);
    setPagina(1);
    setFiltros({
      departamento: 'Nacional',
      anio: 'todos',
      periodo: 'todos',
      nivelOcupacional: 'todos',
    });
    obtenerTendenciaOcupacionalActual(tipoSeguro)
      .then((registros) => {
        if (montado) {
          setDatos(Array.isArray(registros) ? registros : []);
        }
      })
      .catch(() => {
        if (montado) setDatos([]);
      })
      .finally(() => {
        if (montado) setCargando(false);
      });
    return () => {
      montado = false;
    };
  }, [tipoSeguro]);

  // Opciones únicas disponibles para los desplegables basadas en los datos reales
  const departamentosDisponibles = useMemo(
    () => Array.from(new Set(datos.map((d) => d.departamento))).sort(),
    [datos]
  );

  const aniosDisponibles = useMemo(
    () =>
      Array.from(new Set(datos.map((d) => d.anio))).sort((a, b) => b - a),
    [datos]
  );

  const periodosDisponibles = useMemo(
    () => Array.from(new Set(datos.map((d) => d.periodo))),
    [datos]
  );

  const definicionesNivel = useMemo<DefinicionNivel[]>(() => {
    const mapa = new Map<string, DefinicionNivel>();

    for (const item of datos) {
      const raw = (item.nivelOcupacional || '').trim();
      if (!raw) continue;

      const codigo = item.nivelCodigo || raw;
      if (mapa.has(codigo)) continue;

      if (raw.includes(':')) {
        const idx = raw.indexOf(':');
        const tit = raw.substring(0, idx).trim();
        const desc = raw.substring(idx + 1).trim();
        mapa.set(codigo, {
          codigo,
          titulo: tit,
          descripcion: desc,
        });
      } else {
        mapa.set(codigo, {
          codigo,
          titulo: raw,
          descripcion: '',
        });
      }
    }

    return Array.from(mapa.values()).sort((a, b) => a.codigo.localeCompare(b.codigo));
  }, [datos]);

  const nivelesDisponibles = useMemo(() => {
    return Array.from(new Set(datos.map((d) => d.nivelCodigo).filter(Boolean))).sort();
  }, [datos]);

  // Filtrado de registros en memoria
  const registrosFiltrados = useMemo(() => {
    return datos.filter((item) => {
      if (
        filtros.departamento !== 'Nacional' &&
        item.departamento !== filtros.departamento
      ) {
        return false;
      }
      if (filtros.anio !== 'todos' && String(item.anio) !== filtros.anio) {
        return false;
      }
      if (filtros.periodo !== 'todos' && item.periodo !== filtros.periodo) {
        return false;
      }
      if (
        filtros.nivelOcupacional !== 'todos' &&
        item.nivelCodigo !== filtros.nivelOcupacional
      ) {
        return false;
      }
      return true;
    });
  }, [datos, filtros]);

  const totalResultados = registrosFiltrados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalResultados / FILAS_POR_PAGINA));

  // Filas para la página actual
  const resultadosPaginados = useMemo(() => {
    const inicio = (pagina - 1) * FILAS_POR_PAGINA;
    return registrosFiltrados.slice(inicio, inicio + FILAS_POR_PAGINA);
  }, [registrosFiltrados, pagina]);

  const hayFiltrosActivos =
    filtros.departamento !== 'Nacional' ||
    filtros.anio !== 'todos' ||
    filtros.periodo !== 'todos' ||
    filtros.nivelOcupacional !== 'todos';

  const limpiarFiltros = () => {
    setFiltros({
      departamento: 'Nacional',
      anio: 'todos',
      periodo: 'todos',
      nivelOcupacional: 'todos',
    });
    setPagina(1);
  };

  const handleSeleccionarDepartamento = (depto: string) => {
    setFiltros((prev) => ({ ...prev, departamento: depto }));
    setPagina(1);
  };

  const handleSeleccionarAnio = (anio: string) => {
    setFiltros((prev) => ({ ...prev, anio }));
    setPagina(1);
  };

  const handleSeleccionarPeriodo = (periodo: string) => {
    setFiltros((prev) => ({ ...prev, periodo }));
    setPagina(1);
  };

  const handleSeleccionarNivel = (nivel: string) => {
    setFiltros((prev) => ({ ...prev, nivelOcupacional: nivel }));
    setPagina(1);
  };

  const claseAlineacion = (alineacion: 'izquierda' | 'centro' | 'derecha') => {
    if (alineacion === 'izquierda') return 'text-left';
    if (alineacion === 'derecha') return 'text-right';
    return 'text-center';
  };

  const estiloTitulo = colorTitulo ? { color: colorTitulo } : undefined;
  const estiloSubtitulo = colorSubtitulo ? { color: colorSubtitulo } : undefined;
  const estiloDescripcion = colorDescripcion ? { color: colorDescripcion } : undefined;

  const hayCabecera =
    !ocultarEncabezado &&
    ((mostrarTitulo && Boolean(tituloEfectivo)) ||
      (mostrarSubtitulo && Boolean(subtituloEfectivo)) ||
      (mostrarDescripcion && Boolean(descripcionEfectiva)));

  const departamentoActivo =
    filtros.departamento === 'Nacional'
      ? null
      : filtros.departamento;

  return (
    <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      {hayCabecera && (
        <div className="flex flex-col gap-2">
          {mostrarTitulo && tituloEfectivo && (
            <h1
              className={`text-2xl font-bold sm:text-3xl text-[#001631] ${claseAlineacion(
                alineacionTitulo
              )}`}
              style={estiloTitulo}
            >
              {renderizarTituloConResalte(tituloEfectivo)}
            </h1>
          )}
          {mostrarSubtitulo && subtituloEfectivo && (
            <h2
              className={`text-base sm:text-lg font-semibold text-[#344054] ${claseAlineacion(
                alineacionSubtitulo
              )}`}
              style={estiloSubtitulo}
            >
              {subtituloEfectivo}
            </h2>
          )}
          {mostrarDescripcion && descripcionEfectiva && (
            <p
              className={`text-sm sm:text-base text-[#475467] ${claseAlineacion(
                alineacionDescripcion
              )}`}
              style={estiloDescripcion}
            >
              {descripcionEfectiva}
            </p>
          )}
        </div>
      )}

      <FiltrosTendencia
        filtros={filtros}
        departamentosDisponibles={departamentosDisponibles}
        aniosDisponibles={aniosDisponibles}
        periodosDisponibles={periodosDisponibles}
        nivelesDisponibles={nivelesDisponibles}
        onSeleccionarDepartamento={handleSeleccionarDepartamento}
        onSeleccionarAnio={handleSeleccionarAnio}
        onSeleccionarPeriodo={handleSeleccionarPeriodo}
        onSeleccionarNivel={handleSeleccionarNivel}
        onLimpiarFiltros={limpiarFiltros}
        hayFiltrosActivos={hayFiltrosActivos}
      />

      {mostrarDefiniciones && <DefinicionesNivelOcupacional definiciones={definicionesNivel} />}

      {cargando ? (
        <div
          className="rounded-[20px] border border-[#eaecf0] bg-[#f8f9fa] py-16 text-center"
          aria-live="polite"
        >
          <p className="text-sm text-[#667085]">Cargando datos de tendencia ocupacional...</p>
        </div>
      ) : (
        <TablaTendencia
          resultados={resultadosPaginados}
          totalResultados={totalResultados}
          departamentoActivo={departamentoActivo}
          pagina={pagina}
          totalPaginas={totalPaginas}
          onCambiarPagina={setPagina}
        />
      )}
    </div>
  );
}

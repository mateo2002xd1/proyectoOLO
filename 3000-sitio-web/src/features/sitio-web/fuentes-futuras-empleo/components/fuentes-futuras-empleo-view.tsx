'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { BannerDepartamentoFuentes } from './banner-departamento-fuentes';
import { MapaTendencia } from '@/features/sitio-web/tendencia-ocupacional/components/mapa-tendencia';
import { FiltrosFuentesFuturas } from './filtros-fuentes-futuras';
import { TablaFuentesFuturas } from './tabla-fuentes-futuras';
import { obtenerFuentesFuturasEmpleoActual } from '../services/fuentes-futuras.service';
import type {
  RegistroFuenteFutura,
  FuentesFuturasEmpleoViewProps,
  FiltrosFuentesFuturas as IFiltrosFuentesFuturas,
} from '../types';


const TITULO_POR_DEFECTO = 'Fuentes futuras de empleo';
const SUBTITULO_INFO_DEPTO_POR_DEFECTO =
  'Proyectos de inversión nuevos y/o en expansión potencialmente generadores de empleo.';
const DESCRIPCION_INFO_DEPTO_POR_DEFECTO =
  'En lo corrido del año se han detectado {proyectos} proyectos, con una participación del {porcentaje}% sobre el total nacional.';

function renderizarTituloConResalte(texto: string) {
  if (!texto) return null;
  const partes = texto.split(/(más|menos|\+|\-)/gi);
  return partes.map((parte, i) => {
    const pMin = parte.toLowerCase();
    if (pMin === 'más' || parte === '+') {
      return (
        <span key={i} className="text-[#39a900]">
          {parte}
        </span>
      );
    }
    if (pMin === 'menos' || parte === '-') {
      return (
        <span key={i} className="text-[#00324d]">
          {parte}
        </span>
      );
    }
    return <Fragment key={i}>{parte}</Fragment>;
  });
}

export function FuentesFuturasEmpleoView({
  modoSeleccionDepartamento = 'mapa',
  mostrarTotales = true,
  mostrarBannerDepartamento = true,
  subtituloInfoDepto,
  descripcionInfoDepto,
  tituloBanner,
  subtituloBanner = '',
  descripcionBanner = '',
  colorBanner,
  mostrarTitulo = true,
  titulo = TITULO_POR_DEFECTO,
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
}: FuentesFuturasEmpleoViewProps = {}) {
  const [datos, setDatos] = useState<RegistroFuenteFutura[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modoSeleccion, setModoSeleccion] = useState<'lista' | 'mapa'>(
    modoSeleccionDepartamento || 'mapa'
  );



  useEffect(() => {
    if (modoSeleccionDepartamento) {
      setModoSeleccion(modoSeleccionDepartamento);
    }
  }, [modoSeleccionDepartamento]);

  const [filtros, setFiltros] = useState<IFiltrosFuentesFuturas>({
    departamento: 'Nacional',
  });

  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(15);

  const tituloEfectivo =
    typeof titulo === 'string' && titulo.trim() !== ''
      ? titulo
      : TITULO_POR_DEFECTO;

  const subtituloEfectivo =
    typeof subtitulo === 'string' && subtitulo.trim() !== ''
      ? subtitulo
      : '';

  const descripcionEfectiva =
    typeof descripcion === 'string' && descripcion.trim() !== ''
      ? descripcion
      : '';

  // Carga de datos desde backend
  useEffect(() => {
    let montado = true;
    setCargando(true);
    setPagina(1);
    setFiltros({
      departamento: 'Nacional',
    });

    obtenerFuentesFuturasEmpleoActual()
      .then((registros) => {
        if (montado) {
          setDatos(registros);
          setCargando(false);
        }
      })
      .catch((err) => {
        console.warn('[FuentesFuturasEmpleo] Error cargando datos:', err);
        if (montado) {
          setDatos([]);
          setCargando(false);
        }
      });

    return () => {
      montado = false;
    };
  }, []);

  const departamentosDisponibles = useMemo(() => {
    const unicos = new Set<string>();
    datos.forEach((r) => {
      if (r.departamento && r.departamento.toLowerCase() !== 'nacional') {
        unicos.add(r.departamento);
      }
    });
    return Array.from(unicos).sort((a, b) => a.localeCompare(b));
  }, [datos]);

  const esNacional =
    !filtros.departamento || filtros.departamento.toLowerCase() === 'nacional';

  const resultadosFiltrados = useMemo(() => {
    const filtrados = datos.filter((item) => {
      if (!esNacional) {
        if (item.departamento.toLowerCase() !== filtros.departamento.toLowerCase()) {
          return false;
        }
      }
      return true;
    });

    // Ordenar por cuentaProyecto descendente para mejor legibilidad
    return filtrados.sort((a, b) => (Number(b.cuentaProyecto) || 0) - (Number(a.cuentaProyecto) || 0));
  }, [datos, filtros.departamento, esNacional]);

  const totalResultados = resultadosFiltrados.length;
  const totalPaginas = Math.ceil(totalResultados / porPagina) || 1;

  const resultadosPaginados = useMemo(() => {
    const inicio = (pagina - 1) * porPagina;
    return resultadosFiltrados.slice(inicio, inicio + porPagina);
  }, [resultadosFiltrados, pagina, porPagina]);

  const totalCuentaProyectos = useMemo(() => {
    return resultadosFiltrados.reduce(
      (acc, r) => acc + (Number(r.cuentaProyecto) || 0),
      0
    );
  }, [resultadosFiltrados]);

  // Total global de proyectos en todos los registros
  const totalGlobalProyectos = useMemo(() => {
    return datos.reduce((acc, r) => acc + (Number(r.cuentaProyecto) || 0), 0);
  }, [datos]);

  // Total de proyectos del departamento seleccionado
  const totalDeptoProyectos = useMemo(() => {
    if (esNacional) return 0;
    return datos
      .filter(
        (d) =>
          d.departamento &&
          d.departamento.toLowerCase() === filtros.departamento.toLowerCase()
      )
      .reduce((acc, r) => acc + (Number(r.cuentaProyecto) || 0), 0);
  }, [datos, filtros.departamento, esNacional]);

  // Porcentaje del departamento con respecto al total nacional (ej. 0,7%)
  const porcentajeDepto = useMemo(() => {
    if (totalGlobalProyectos === 0 || totalDeptoProyectos === 0) return '0,0';
    return ((totalDeptoProyectos / totalGlobalProyectos) * 100)
      .toFixed(1)
      .replace('.', ',');
  }, [totalGlobalProyectos, totalDeptoProyectos]);

  const totalDeptoProyectosFormateado = useMemo(() => {
    return totalDeptoProyectos.toLocaleString('es-CO');
  }, [totalDeptoProyectos]);

  const totalGlobalProyectosFormateado = useMemo(() => {
    return totalGlobalProyectos.toLocaleString('es-CO');
  }, [totalGlobalProyectos]);

  // Cantidad de sectores con proyectos en el departamento seleccionado
  const totalSectores = useMemo(() => {
    if (esNacional) return 0;
    const sectoresSet = new Set<string>();
    datos
      .filter((d) => d.departamento && d.departamento.toLowerCase() === filtros.departamento.toLowerCase())
      .forEach((d) => {
        if (d.sector && d.sector.trim()) sectoresSet.add(d.sector.trim());
      });
    return sectoresSet.size;
  }, [datos, filtros.departamento, esNacional]);

  // Lista de sectores del departamento seleccionados unidos por coma
  const sectoresTexto = useMemo(() => {
    if (esNacional) return '';
    const sectoresSet = new Set<string>();
    datos
      .filter((d) => d.departamento && d.departamento.toLowerCase() === filtros.departamento.toLowerCase())
      .forEach((d) => {
        if (d.sector && d.sector.trim()) sectoresSet.add(d.sector.trim());
      });
    return Array.from(sectoresSet).join(', ');
  }, [datos, filtros.departamento, esNacional]);

  // Principales fuentes del departamento seleccionado unidas por coma
  const principalesFuentesTexto = useMemo(() => {
    if (esNacional) return '';

    const fuentes = new Set<string>();
    datos
      .filter((d) => d.departamento.toLowerCase() === filtros.departamento.toLowerCase())
      .forEach((d) => {
        const val = (d.principalesFuentes || '').trim();
        if (val) {
          fuentes.add(val);
        }
      });

    return Array.from(fuentes).join(', ');
  }, [datos, filtros.departamento, esNacional]);

  const hayFiltrosActivos = !esNacional;

  const limpiarFiltros = () => {
    setFiltros({ departamento: 'Nacional' });
    setPagina(1);
  };

  const handleSeleccionarDepartamento = (depto: string) => {
    setFiltros({ departamento: depto });
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

  const departamentoActivo = esNacional ? null : filtros.departamento;

  // Solo se muestra cuando la opción está activa (mostrarBannerDepartamento)
  // Y se ha seleccionado un departamento específico (!esNacional).
  // Cuando es Nacional o no hay ningún departamento seleccionado en el mapa, se oculta completamente.
  const debeMostrarAvisoDepartamento = Boolean(mostrarBannerDepartamento) && !esNacional;

  const departamentoBannerEfectivo = filtros.departamento;
  const tituloBannerEfectivo = departamentoBannerEfectivo;

  const subtituloInfoDeptoEfectivo =
    subtituloInfoDepto !== undefined
      ? subtituloInfoDepto
      : SUBTITULO_INFO_DEPTO_POR_DEFECTO;

  const plantillaDescripcion =
    descripcionInfoDepto !== undefined
      ? descripcionInfoDepto
      : DESCRIPCION_INFO_DEPTO_POR_DEFECTO;

  const descripcionInfoDeptoEfectiva = useMemo(() => {
    if (!plantillaDescripcion || !plantillaDescripcion.trim()) return '';

    return plantillaDescripcion
      .replace(
        /\{proyectos\}|\{proyecto\}|\{cuenta\}|\{total\}|\{cuentaProyecto\}/gi,
        totalDeptoProyectosFormateado
      )
      .replace(/\{porcentaje\}%?/gi, `${porcentajeDepto}%`)
      .replace(/\{participacion\}%?/gi, `${porcentajeDepto}%`)
      .replace(
        /\{totalGlobal\}|\{totalNacional\}/gi,
        totalGlobalProyectosFormateado
      )
      .replace(/\{departamento\}|\{depto\}/gi, departamentoBannerEfectivo)
      .replace(/\{totalSectores\}|\{numSectores\}/gi, String(totalSectores))
      .replace(/\{fuentes\}|\{principalesFuentes\}/gi, principalesFuentesTexto)
      .replace(/\{sectores\}|\{listaSectores\}/gi, sectoresTexto);
  }, [
    plantillaDescripcion,
    totalDeptoProyectosFormateado,
    porcentajeDepto,
    totalGlobalProyectosFormateado,
    departamentoBannerEfectivo,
    totalSectores,
    principalesFuentesTexto,
    sectoresTexto,
  ]);

  const renderBannerAviso = () => {
    if (!debeMostrarAvisoDepartamento) return null;

    return (
      <BannerDepartamentoFuentes
        departamento={departamentoBannerEfectivo}
        titulo={tituloBannerEfectivo}
        subtitulo={subtituloInfoDeptoEfectivo}
        descripcion={descripcionInfoDeptoEfectiva}
        fuentes={principalesFuentesTexto}
        colorFondo={colorBanner}
      />
    );
  };

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

      {cargando ? (
        <div
          className="rounded-[20px] border border-[#eaecf0] bg-[#f8f9fa] py-16 text-center"
          aria-live="polite"
        >
          <p className="text-sm text-[#667085]">Cargando datos de fuentes futuras de empleo...</p>
        </div>
      ) : datos.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-[#d0d5dd] bg-[#fcfcfd] p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f2f4f7] text-[#667085]">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-[#344054]">
            {tituloEfectivo}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#667085]">
            Aún no hay datos cargados para este componente. Cuando se agregue el archivo{' '}
            <code className="rounded bg-[#f2f4f7] px-1.5 py-0.5 text-xs font-semibold text-[#344054]">
              fuentes-futuras-de-empleo.xlsx
            </code>{' '}
            en la carpeta de uploads del backend, los registros se visualizarán aquí automáticamente.
          </p>
        </div>
      ) : modoSeleccion === 'mapa' ? (
        <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-start">
          <div className="w-full 2xl:sticky 2xl:top-[104px] 2xl:w-[440px] 2xl:flex-shrink-0">
            <MapaTendencia
              departamentosConDatos={departamentosDisponibles}
              departamentoSeleccionado={filtros.departamento}
              onSeleccionar={handleSeleccionarDepartamento}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <FiltrosFuentesFuturas
              departamentoSeleccionado={filtros.departamento}
              departamentosDisponibles={departamentosDisponibles}
              modoSeleccionDepartamento={modoSeleccion}
              onCambiarModoSeleccion={setModoSeleccion}
              onSeleccionarDepartamento={handleSeleccionarDepartamento}
              onLimpiarFiltros={limpiarFiltros}
              hayFiltrosActivos={hayFiltrosActivos}
            />

            {renderBannerAviso()}

            <TablaFuentesFuturas
              resultados={resultadosPaginados}
              totalResultados={totalResultados}
              totalCuentaProyectos={totalCuentaProyectos}
              departamentoActivo={departamentoActivo}
              pagina={pagina}
              totalPaginas={totalPaginas}
              onCambiarPagina={setPagina}
              porPagina={porPagina}
              onCambiarPorPagina={(nuevo) => {
                setPorPagina(nuevo);
                setPagina(1);
              }}
              mostrarTotales={mostrarTotales}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <FiltrosFuentesFuturas
            departamentoSeleccionado={filtros.departamento}
            departamentosDisponibles={departamentosDisponibles}
            modoSeleccionDepartamento={modoSeleccion}
            onCambiarModoSeleccion={setModoSeleccion}
            onSeleccionarDepartamento={handleSeleccionarDepartamento}
            onLimpiarFiltros={limpiarFiltros}
            hayFiltrosActivos={hayFiltrosActivos}
          />

          {renderBannerAviso()}

          <TablaFuentesFuturas
            resultados={resultadosPaginados}
            totalResultados={totalResultados}
            totalCuentaProyectos={totalCuentaProyectos}
            departamentoActivo={departamentoActivo}
            pagina={pagina}
            totalPaginas={totalPaginas}
            onCambiarPagina={setPagina}
            porPagina={porPagina}
            onCambiarPorPagina={(nuevo) => {
              setPorPagina(nuevo);
              setPagina(1);
            }}
            mostrarTotales={mostrarTotales}
          />
        </div>
      )}
    </div>
  );
}

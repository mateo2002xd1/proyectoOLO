'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { CRITERIO_POR_TIPO, TITULOS_TENDENCIA } from '../data/base-tendencia-datos';
import {
  buscarTendenciaOcupacional,
  obtenerOpcionesTendencia,
} from '../services/tendencia-ocupacional.service';
import { FiltrosTendencia } from './filtros-tendencia';
import { BannerDepartamento } from './banner-departamento';
import { DefinicionesNivelOcupacional } from './definiciones-nivel-ocupacional';
import { MapaTendencia } from './mapa-tendencia';
import { TablaTendencia } from './tabla-tendencia';

import type {
  DefinicionNivel,
  FiltrosTendencia as IFiltrosTendencia,
  OpcionesTendenciaOcupacional,
  PeriodoTendencia,
  ResultadoTendenciaOcupacional,
  TendenciaOcupacionalViewProps,
  TipoTendenciaOcupacional,
} from '../types';



const FILTROS_INICIALES: IFiltrosTendencia = {
  departamento: 'nacional',
  anio: '',
  periodo: '',
  nivelOcupacional: '',
  incluirSinRegistros: false,
};

/**
 * Periodo que se muestra al llegar o al cambiar de año: el de mayor cobertura con datos,
 * que en el orden del catálogo es el último disponible (Anual, luego los semestres, luego
 * el trimestre más reciente).
 */
function periodoPorDefecto(periodos: PeriodoTendencia[]): string {
  return [...periodos].reverse().find((p) => p.disponible)?.codigo ?? '';
}

interface RespuestaConsulta {
  clave: string;
  /** `null` si la consulta falló. */
  resultado: ResultadoTendenciaOcupacional | null;
}

const esCancelacion = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';

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

function AvisoEstado({ children, accion }: { children: React.ReactNode; accion?: React.ReactNode }) {
  return (
    <div className="rounded-[20px] border border-[#eaecf0] bg-[#f8f9fa] py-16 text-center" aria-live="polite">
      <p className="text-sm text-[#667085]">{children}</p>
      {accion}
    </div>
  );
}

export function TendenciaOcupacionalView({
  tipoTendencia = 'mas-menos',
  mostrarDefiniciones = true,
  mostrarTotales = false,
  mostrarBannerDepartamento = false,
  modoSeleccionDepartamento = 'lista',
  tituloBanner,
  subtituloBanner = '',
  descripcionBanner = '',
  colorBanner,
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
  const [modoSeleccion, setModoSeleccion] = useState<'lista' | 'mapa'>(
    modoSeleccionDepartamento || 'lista'
  );

  const tipoSeguro: TipoTendenciaOcupacional =
    tipoTendencia && TITULOS_TENDENCIA[tipoTendencia] ? tipoTendencia : 'mas-menos';
  // Cada bloque consulta un solo criterio: es lo que diferencia los cuatro cuadrantes.
  const criterio = CRITERIO_POR_TIPO[tipoSeguro];

  const [opciones, setOpciones] = useState<OpcionesTendenciaOcupacional | null>(null);
  const [errorOpciones, setErrorOpciones] = useState(false);
  const [filtros, setFiltros] = useState<IFiltrosTendencia>(FILTROS_INICIALES);
  /** Año y periodo con los que se llegó: a esto vuelve "Limpiar filtros". */
  const [porDefecto, setPorDefecto] = useState<{ anio: string; periodo: string } | null>(null);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(15);
  /** La última respuesta, con la clave de la consulta que la pidió. */
  const [respuesta, setRespuesta] = useState<RespuestaConsulta | null>(null);
  /** Sube con "Reintentar" para repetir la consulta que falló. */
  const [intento, setIntento] = useState(0);
  /** Año de las opciones cargadas: evita pedirlas dos veces para el mismo año. */
  const anioDeOpciones = useRef<string | null>(null);

  // Cambios que llegan del editor (otro modo u otro cuadrante): se ajustan al pintar, no
  // en un efecto, para no pintar dos veces. Otro cuadrante vuelve a la página 1 porque
  // la página vieja puede no existir en el nuevo.
  const [anteriores, setAnteriores] = useState({ modo: modoSeleccionDepartamento, criterio });
  if (anteriores.modo !== modoSeleccionDepartamento || anteriores.criterio !== criterio) {
    if (anteriores.modo !== modoSeleccionDepartamento && modoSeleccionDepartamento) {
      setModoSeleccion(modoSeleccionDepartamento);
    }
    if (anteriores.criterio !== criterio) setPagina(1);
    setAnteriores({ modo: modoSeleccionDepartamento, criterio });
  }

  // Opciones de los filtros. Se vuelven a pedir al cambiar de año, porque de eso depende
  // qué periodos tienen datos publicados.
  useEffect(() => {
    if (filtros.anio && anioDeOpciones.current === filtros.anio) return;

    const control = new AbortController();
    obtenerOpcionesTendencia(filtros.anio ? Number(filtros.anio) : undefined, control.signal)
      .then((nuevas) => {
        const anio = nuevas.anio === null ? '' : String(nuevas.anio);
        anioDeOpciones.current = anio;
        setOpciones(nuevas);
        setErrorOpciones(false);
        setFiltros((previos) => {
          // Si el periodo elegido no tiene datos en el año nuevo, se pasa al de por defecto.
          const periodoSigue = nuevas.periodos.some((p) => p.codigo === previos.periodo && p.disponible);
          const periodo = periodoSigue ? previos.periodo : periodoPorDefecto(nuevas.periodos);
          return previos.anio === anio && previos.periodo === periodo ? previos : { ...previos, anio, periodo };
        });
        setPorDefecto((actual) => actual ?? { anio, periodo: periodoPorDefecto(nuevas.periodos) });
      })
      .catch((error) => {
        if (!esCancelacion(error)) setErrorOpciones(true);
      });
    return () => control.abort();
  }, [filtros.anio, intento]);

  // La consulta: filtros, criterio y página viajan a la API, que filtra y pagina en SQL.
  // Espera a tener las opciones del año elegido para no consultar un periodo que en ese
  // año no existe y pintar un "sin registros" que dura un instante.
  const consultaLista =
    opciones !== null && filtros.anio !== '' && filtros.periodo !== '' && String(opciones.anio) === filtros.anio;
  const clave = consultaLista ? JSON.stringify([criterio, filtros, pagina, porPagina, intento]) : null;

  useEffect(() => {
    if (!clave) return;

    const control = new AbortController();
    buscarTendenciaOcupacional(criterio, filtros, pagina, porPagina, control.signal)
      .then((resultado) => setRespuesta({ clave, resultado }))
      .catch((error) => {
        if (!esCancelacion(error)) setRespuesta({ clave, resultado: null });
      });
    return () => control.abort();
  }, [clave, criterio, filtros, pagina, porPagina]);

  // Mientras llega la respuesta nueva se sigue viendo la anterior, atenuada.
  const cargando = clave !== null && respuesta?.clave !== clave;
  const errorResultado = respuesta !== null && respuesta.clave === clave && respuesta.resultado === null;
  const resultado = respuesta?.resultado ?? null;

  const cambiarFiltros = (cambios: Partial<IFiltrosTendencia>) => {
    setFiltros((previos) => ({ ...previos, ...cambios }));
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setFiltros({ ...FILTROS_INICIALES, ...(porDefecto ?? {}) });
    setPagina(1);
  };

  const hayFiltrosActivos =
    filtros.departamento !== 'nacional' ||
    filtros.nivelOcupacional !== '' ||
    filtros.incluirSinRegistros ||
    (porDefecto !== null && (filtros.anio !== porDefecto.anio || filtros.periodo !== porDefecto.periodo));

  const nombrePorValor = useMemo(
    () => new Map((opciones?.departamentos ?? []).map((d) => [d.valor, d.nombre])),
    [opciones]
  );

  const definicionesNivel = useMemo<DefinicionNivel[]>(
    () =>
      (opciones?.niveles ?? []).map((nivel) => ({
        codigo: nivel.codigo,
        titulo: nivel.etiqueta,
        descripcion: nivel.descripcion ?? '',
      })),
    [opciones]
  );

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

  const nombreDepartamento = nombrePorValor.get(filtros.departamento) ?? 'Nacional';
  const departamentoActivo = filtros.departamento === 'nacional' ? null : nombreDepartamento;
  const sinDatosPublicados = opciones !== null && opciones.anios.length === 0;

  const reintentar = () => {
    setErrorOpciones(false);
    setIntento((n) => n + 1);
  };

  const botonReintentar = (
    <button
      type="button"
      onClick={reintentar}
      className="mt-4 inline-flex h-10 items-center justify-center rounded-[16px] border border-[#d0d5dd] bg-white px-4 text-xs font-semibold text-[#344054] transition hover:bg-[#f2f4f7] focus:outline-none focus:ring-2 focus:ring-[#002237]/20"
    >
      Reintentar
    </button>
  );

  let contenido: React.ReactNode;
  if (errorOpciones || errorResultado) {
    contenido = (
      <AvisoEstado accion={botonReintentar}>
        No se pudieron consultar los datos de tendencia ocupacional en este momento.
      </AvisoEstado>
    );
  } else if (sinDatosPublicados) {
    contenido = <AvisoEstado>Todavía no hay datos de tendencia ocupacional publicados.</AvisoEstado>;
  } else if (!resultado) {
    contenido = <AvisoEstado>Cargando datos de tendencia ocupacional...</AvisoEstado>;
  } else {
    contenido = (
      <div aria-busy={cargando} className={`transition-opacity ${cargando ? 'opacity-60' : ''}`}>
        <TablaTendencia
          resultados={resultado.registros}
          totalResultados={resultado.total}
          departamentoActivo={departamentoActivo}
          pagina={pagina}
          totalPaginas={resultado.totalPaginas}
          onCambiarPagina={setPagina}
          porPagina={porPagina}
          onCambiarPorPagina={(nuevoPorPagina) => {
            setPorPagina(nuevoPorPagina);
            setPagina(1);
          }}
          totales={{ totalInscritos: resultado.totales.inscritos, totalVacantes: resultado.totales.vacantes }}
          mostrarTotales={mostrarTotales}
        />
      </div>
    );
  }

  const filtrosYResultados = (
    <>
      {opciones && !sinDatosPublicados && (
        <FiltrosTendencia
          filtros={filtros}
          opciones={opciones}
          modoSeleccionDepartamento={modoSeleccion}
          onCambiarModoSeleccion={setModoSeleccion}
          onCambiar={cambiarFiltros}
          onLimpiarFiltros={limpiarFiltros}
          hayFiltrosActivos={hayFiltrosActivos}
        />
      )}

      {mostrarBannerDepartamento && (
        <BannerDepartamento
          departamento={nombreDepartamento}
          titulo={tituloBanner}
          subtitulo={subtituloBanner}
          descripcion={descripcionBanner}
          colorFondo={colorBanner}
        />
      )}

      {mostrarDefiniciones && <DefinicionesNivelOcupacional definiciones={definicionesNivel} />}

      {contenido}
    </>
  );

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

      {modoSeleccion === 'mapa' ? (
        <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-start">
          <div className="w-full 2xl:sticky 2xl:top-[104px] 2xl:w-[440px] 2xl:flex-shrink-0">
            <MapaTendencia
              codigosConDatos={resultado?.departamentosConResultados ?? []}
              codigoSeleccionado={filtros.departamento}
              onSeleccionar={(departamento) => cambiarFiltros({ departamento })}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">{filtrosYResultados}</div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">{filtrosYResultados}</div>
      )}
    </div>
  );
}

'use client';

import { useMemo, useRef, useState } from 'react';
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/20/solid';
import { CustomSelect } from '@/shared/ui/molecules/custom-select';
import { YearPicker } from '@/shared/ui/molecules/year-picker';
import { useCargasTendencia } from '../hooks/use-cargas-tendencia';
import { detectarCelda } from '../lib/detectar-celda';
import { RANGO_ANIOS_TENDENCIA } from '../lib/rango-anios';
import { BarraDeProgreso } from './barra-de-progreso';
import { DescargarFormato } from './descargar-formato';
import { EstadoFlag, estadoDeCarga, estadoDeCelda, resumenDeFilas, type TonoEstado } from './estado-flag';
import { HistorialCargasTendencia } from './historial-cargas-tendencia';
import { ReporteCargaTendencia } from './reporte-carga-tendencia';
import type { CeldaTendencia } from '../types';

/** Fases de `importarPercentilesExcel` en el backend (ver `ProgresoCarga`). */
const etiquetaFase = (progreso: number) =>
  progreso < 40
    ? 'Leyendo el archivo'
    : progreso < 60
      ? 'Preparando las filas'
      : progreso < 85
        ? 'Validando (V1–V9)'
        : 'Guardando en la base de datos';

/**
 * Solo se carga en una celda libre: sin datos y sin una carga en curso. Una con datos no
 * admite otro archivo; para cambiarlo se elimina antes su carga desde el historial (la API
 * aplica la misma regla y responde 409).
 */
const estaLibre = (celda: CeldaTendencia) => celda.estadoCelda === 'pendiente' || celda.estadoCelda === 'fallido';

/** Fondo del resultado de la última carga, del mismo color que su flag. */
const CAJA: Record<TonoEstado, string> = {
  libre: 'border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/40',
  inactivo: 'border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/40',
  curso: 'border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-900/20',
  borrador: 'border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-900/20',
  publicado: 'border-green-200 bg-green-50 dark:border-green-900/60 dark:bg-green-900/20',
  error: 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-900/20',
};

const BOTON_PUBLICAR =
  'rounded-md bg-brand-interactive px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-brand-interactive-hover disabled:opacity-50';

/**
 * Lo cargado que el sitio todavía no muestra, en una línea con su botón de publicar. Sin
 * este aviso el paso se pasaba por alto: «Carga completada» parecía el final.
 */
function PendientesDePublicar({
  celdas,
  onPublicar,
  cortesEnAccion,
}: {
  celdas: CeldaTendencia[];
  /** Ausente en solo lectura. */
  onPublicar?: (...corteIds: string[]) => void;
  cortesEnAccion: string[];
}) {
  if (celdas.length === 0) return null;
  const corteIds = celdas.flatMap((c) => (c.corteId === null ? [] : [c.corteId]));
  const publicandoTodos = corteIds.length > 1 && corteIds.every((id) => cortesEnAccion.includes(id));

  return (
    <div
      role="status"
      className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900/60 dark:bg-amber-900/20"
    >
      <EstadoFlag estado={{ tono: 'borrador', texto: 'Sin publicar' }} />
      {celdas.map((c) => {
        const corteId = c.corteId;
        const ocupado = corteId !== null && cortesEnAccion.includes(corteId);
        return (
          <span
            key={`${c.anio}-${c.periodoCodigo}`}
            className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-white py-0.5 pl-2.5 pr-0.5 text-amber-950 dark:border-amber-900/60 dark:bg-transparent dark:text-amber-100"
          >
            {c.anio} · {c.periodoNombre}
            {onPublicar && corteId !== null && (
              <button type="button" onClick={() => onPublicar(corteId)} disabled={ocupado} className={BOTON_PUBLICAR}>
                {ocupado ? 'Publicando…' : 'Publicar'}
              </button>
            )}
          </span>
        );
      })}
      {onPublicar && corteIds.length > 1 && (
        <button
          type="button"
          onClick={() => onPublicar(...corteIds)}
          disabled={cortesEnAccion.length > 0}
          className="px-1 text-xs font-medium text-brand-interactive hover:underline disabled:opacity-50"
        >
          {publicandoTodos ? 'Publicando…' : 'Publicar todos'}
        </button>
      )}
      {!onPublicar && <span className="text-xs text-amber-800 dark:text-amber-200">Los publica un Administrador.</span>}
    </div>
  );
}

interface CargaCriteriosClasificacionProps {
  /** Solo Administrador/Superadmin carga y publica; el resto ve el historial. */
  puedeActualizar: boolean;
}

/**
 * Tarjeta "Criterios de clasificación de resultados" de Actualizaciones: los percentiles
 * de inscritos y vacantes que alimentan los bloques de Tendencia Ocupacional del sitio.
 *
 * Un archivo por año y periodo: el Excel no los trae, así que se eligen aquí (y se
 * proponen desde el nombre del archivo si lo dice). Solo en un periodo libre: uno con datos
 * no se recarga, se elimina antes su carga. La carga queda en borrador hasta que se
 * publica —desde el aviso de pendientes, el resultado de la carga o el historial—.
 *
 * Los estados se dicen con un flag de color (`EstadoFlag`), el mismo en toda la tarjeta, y
 * los textos solo dicen lo que el flag no dice: qué hacer.
 */
export function CargaCriteriosClasificacion({ puedeActualizar }: CargaCriteriosClasificacionProps) {
  const t = useCargasTendencia();
  const inputRef = useRef<HTMLInputElement>(null);

  const [anio, setAnio] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  /** Aviso sobre lo que dice el nombre del archivo frente a la celda elegida. */
  const [avisoNombre, setAvisoNombre] = useState<string | null>(null);

  // El año es libre: se elige en el calendario o se escribe (cualquiera de cuatro cifras,
  // como piden la API y la base); los periodos salen de la matriz de la API.
  const rangoAnios = RANGO_ANIOS_TENDENCIA;
  const opcionesPeriodo = useMemo(() => {
    const vistos = new Map<string, string>();
    for (const c of t.celdas ?? []) if (!vistos.has(c.periodoCodigo)) vistos.set(c.periodoCodigo, c.periodoNombre);
    return Array.from(vistos, ([value, label]) => ({ value, label }));
  }, [t.celdas]);

  const nombrePeriodo = (codigo: string) => opcionesPeriodo.find((p) => p.value === codigo)?.label ?? codigo;
  const buscarCelda = (anioCelda: string, periodoCelda: string) =>
    t.celdas?.find((c) => String(c.anio) === anioCelda && c.periodoCodigo === periodoCelda) ?? null;
  const celdaElegida = buscarCelda(anio, periodo);
  const celdaOcupada = celdaElegida !== null && !estaLibre(celdaElegida);
  const procesando = t.subiendo || t.cargaEnProceso !== null;

  // Con el año elegido, los periodos que ya tienen datos se marcan en el desplegable, para
  // verlo antes de elegir. Siguen elegibles: al elegirlos se explica qué hacer.
  const opcionesPeriodoDelAnio = opcionesPeriodo.map((opcion) => {
    const celda = anio ? buscarCelda(anio, opcion.value) : null;
    if (!celda || estaLibre(celda)) return opcion;
    return { ...opcion, label: `${opcion.label} · ${celda.estadoCelda === 'procesando' ? 'en curso' : 'ya cargado'}` };
  });

  // Un año que la matriz no trae (uno futuro antes de cargarlo) no tiene celda y está libre; la
  // matriz sí tiene que haber llegado, para no dar por libre lo que todavía no se sabe.
  const puedeEnviar =
    anio !== '' && periodo !== '' && t.celdas !== null && !celdaOcupada && archivo !== null && !procesando;

  /** Filtra el historial por la celda elegida y lo muestra: ahí se elimina su carga. */
  const verEnHistorial = () => {
    t.cambiarFiltro({ anio, periodo });
    document.getElementById('historial-criterios-clasificacion')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /** Compara lo que sugiere el nombre del archivo con la celda elegida. */
  const revisarNombre = (nombre: string, anioElegido: string, periodoElegido: string) => {
    const sugerida = detectarCelda(nombre);
    if (!sugerida || !anioElegido || !periodoElegido) return setAvisoNombre(null);
    const coincide = String(sugerida.anio) === anioElegido && sugerida.periodoCodigo === periodoElegido;
    setAvisoNombre(
      coincide ? null : `El nombre del archivo sugiere ${sugerida.anio} · ${nombrePeriodo(sugerida.periodoCodigo)}.`
    );
  };

  const alElegirArchivo = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const elegido = evento.target.files?.[0] ?? null;
    setArchivo(elegido);
    if (!elegido) return setAvisoNombre(null);

    // Si todavía no eligió celda, se propone la del nombre del archivo (solo si existe).
    const sugerida = detectarCelda(elegido.name);
    const existe = sugerida && sugerida.anio >= rangoAnios.min && sugerida.anio <= rangoAnios.max;
    if (!anio && !periodo && sugerida && existe) {
      setAnio(String(sugerida.anio));
      setPeriodo(sugerida.periodoCodigo);
      setAvisoNombre('Año y periodo tomados del nombre del archivo.');
      return;
    }
    revisarNombre(elegido.name, anio, periodo);
  };

  const cambiarCelda = (cambios: { anio?: string; periodo?: string }) => {
    const nuevoAnio = cambios.anio ?? anio;
    const nuevoPeriodo = cambios.periodo ?? periodo;
    setAnio(nuevoAnio);
    setPeriodo(nuevoPeriodo);
    if (archivo) revisarNombre(archivo.name, nuevoAnio, nuevoPeriodo);
  };

  const cargar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!puedeEnviar || !archivo) return;
    const subio = await t.subir(archivo, { anio, periodo });
    if (subio) {
      // El periodo se limpia: su estado lo cuenta ya el resultado de la carga, y repetirlo
      // arriba («Borrador · ya tiene datos») era el mismo mensaje dos veces. El año se
      // queda, que es lo habitual al cargar varios periodos seguidos.
      setPeriodo('');
      setArchivo(null);
      setAvisoNombre(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const ultima = t.ultimaCarga;
  const celdaDeUltima = ultima
    ? t.celdas?.find((c) => c.anio === ultima.anio && c.periodoCodigo === ultima.periodoCodigo)
    : undefined;
  /** Corte de la última carga si terminó bien pero sigue en borrador: el sitio aún no lo muestra. */
  const corteSinPublicar =
    ultima?.estado === 'completado' && celdaDeUltima?.estadoCelda === 'borrador' ? celdaDeUltima.corteId : null;
  // El flag de la última carga sale de la matriz, que se refresca al publicar; la carga
  // guardada al terminar seguiría diciendo «Borrador».
  const estadoUltima = ultima
    ? ultima.estado === 'completado' && celdaDeUltima
      ? estadoDeCelda(celdaDeUltima)
      : estadoDeCarga(ultima)
    : null;
  const filasUltima = ultima?.estado === 'completado' ? resumenDeFilas(ultima) : null;

  // Todo lo cargado que el sitio todavía no muestra. El corte de la última carga no se
  // repite aquí: su recuadro de resultado ya ofrece publicarlo.
  const pendientes = (t.celdas ?? [])
    .filter((c) => c.estadoCelda === 'borrador' && c.corteId !== null && c.corteId !== corteSinPublicar)
    .sort((a, b) => b.anio - a.anio);

  return (
    <section
      aria-labelledby="titulo-criterios-clasificacion"
      className="col-span-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f]"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div>
          <h2 id="titulo-criterios-clasificacion" className="font-semibold text-[#001631] dark:text-[#f6f6f6]">
            Criterios de clasificación de resultados
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-[#94a3b8]">
            Percentiles de inscritos y vacantes para Tendencia Ocupacional. Un archivo .xlsx por año y periodo.
          </p>
        </div>
        {puedeActualizar && <DescargarFormato formato="tendencia-ocupacional" />}
      </div>

      {t.errorEstado && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{t.errorEstado}</p>}

      <PendientesDePublicar
        celdas={pendientes}
        onPublicar={puedeActualizar ? t.publicar : undefined}
        cortesEnAccion={t.cortesEnAccion}
      />

      {puedeActualizar ? (
        <form onSubmit={cargar} className="mt-5" aria-describedby="ayuda-carga-criterios">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[10rem_18rem_minmax(0,1fr)_auto] lg:items-end">
            <div>
              <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-zinc-300">Año</span>
              <YearPicker
                value={anio}
                onChange={(valor) => cambiarCelda({ anio: valor })}
                min={rangoAnios.min}
                max={rangoAnios.max}
                placeholder="Elija el año"
                ariaLabel="Año del archivo"
                disabled={procesando || !t.celdas}
              />
            </div>
            <div>
              <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-zinc-300">Periodo</span>
              <CustomSelect
                value={periodo}
                onChange={(valor) => cambiarCelda({ periodo: valor })}
                options={opcionesPeriodoDelAnio}
                placeholder="Elija el periodo"
                ariaLabel="Periodo del archivo"
                disabled={procesando || !t.celdas}
              />
            </div>
            <div className="min-w-0">
              <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-zinc-300">Archivo</span>
              <label
                title="Con las hojas «percentiles nacional» y «percentiles departamental»"
                className={`flex h-11 min-w-0 items-center gap-2 rounded-[16px] border border-dashed px-3 text-sm transition-colors ${
                  procesando
                    ? 'cursor-not-allowed border-zinc-300 text-zinc-400 dark:border-zinc-700'
                    : 'cursor-pointer border-zinc-300 text-zinc-600 hover:border-brand-interactive hover:text-brand-interactive dark:border-zinc-600 dark:text-zinc-300'
                }`}
              >
                <DocumentIcon className="size-4 shrink-0" />
                <span className="truncate">{archivo ? archivo.name : 'Elegir archivo .xlsx'}</span>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx"
                  onChange={alElegirArchivo}
                  disabled={procesando}
                  className="sr-only"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={!puedeEnviar}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-interactive px-4 text-sm font-medium text-white transition-colors hover:bg-brand-interactive-hover disabled:cursor-not-allowed disabled:bg-brand-interactive/50"
            >
              <ArrowUpTrayIcon className="size-4" />
              {t.subiendo ? 'Subiendo...' : t.cargaEnProceso ? 'Procesando...' : 'Cargar'}
            </button>
          </div>

          <div id="ayuda-carga-criterios" className="mt-3 space-y-1.5 text-sm">
            {anio && periodo && t.celdas ? (
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-600 dark:text-[#94a3b8]">
                <EstadoFlag estado={estadoDeCelda(celdaElegida)} />
                <span className="font-medium text-[#001631] dark:text-[#f6f6f6]">
                  {anio} · {nombrePeriodo(periodo)}
                </span>
                {celdaOcupada && (
                  <>
                    <span>
                      {celdaElegida?.estadoCelda === 'procesando'
                        ? 'Espere a que termine.'
                        : 'Ya tiene datos: para cambiarlos, elimine su carga.'}
                    </span>
                    <button
                      type="button"
                      onClick={verEnHistorial}
                      className="font-medium text-brand-interactive underline-offset-2 hover:underline"
                    >
                      Ver en el historial
                    </button>
                  </>
                )}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-[#94a3b8]">
                Si el nombre del archivo trae año y periodo (<code>percentiles_2025_T1.xlsx</code>), se llenan solos.
              </p>
            )}

            {avisoNombre && <p className="text-amber-700 dark:text-amber-300">{avisoNombre}</p>}
            {t.errorSubida && <p className="text-red-600 dark:text-red-400">{t.errorSubida}</p>}
          </div>

          {t.cargaEnProceso && (
            <div>
              <p className="mt-3 text-sm text-gray-700 dark:text-zinc-300">
                Cargando {t.cargaEnProceso.anio} · {t.cargaEnProceso.periodoNombre}
              </p>
              <BarraDeProgreso
                progreso={t.cargaEnProceso.progreso}
                filasProcesadas={t.cargaEnProceso.filasProcesadas}
                filasTotales={t.cargaEnProceso.filasTotales}
                fase={etiquetaFase(t.cargaEnProceso.progreso)}
              />
            </div>
          )}

          {ultima && estadoUltima && (
            <div role="status" className={`mt-4 rounded-lg border px-3 py-2.5 text-sm ${CAJA[estadoUltima.tono]}`}>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <EstadoFlag estado={estadoUltima} />
                <span className="font-medium text-[#001631] dark:text-[#f6f6f6]">
                  {ultima.anio} · {ultima.periodoNombre}
                </span>
                <span className="text-gray-600 dark:text-[#94a3b8]">
                  {filasUltima ? (
                    <>
                      {filasUltima.total} <span className="text-xs">({filasUltima.detalle})</span>
                    </>
                  ) : (
                    ultima.mensaje
                  )}
                </span>
                {corteSinPublicar !== null && (
                  <button
                    type="button"
                    onClick={() => t.publicar(corteSinPublicar)}
                    disabled={t.cortesEnAccion.includes(corteSinPublicar)}
                    className={`sm:ml-auto ${BOTON_PUBLICAR}`}
                  >
                    {t.cortesEnAccion.includes(corteSinPublicar) ? 'Publicando…' : 'Publicar en el sitio'}
                  </button>
                )}
              </div>
              <ReporteCargaTendencia reporte={ultima.reporte} />
            </div>
          )}
        </form>
      ) : (
        <p className="mt-4 text-sm text-gray-500 dark:text-[#94a3b8]">Solo un Administrador carga y publica estos archivos.</p>
      )}

      {t.errorAccion && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{t.errorAccion}</p>}
      {t.avisoEliminacion && (
        <p role="status" className="mt-3 text-sm text-gray-700 dark:text-zinc-300">
          {t.avisoEliminacion}
        </p>
      )}
      {t.errorHistorial && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{t.errorHistorial}</p>}

      <div id="historial-criterios-clasificacion" className="mt-6 scroll-mt-6">
        <HistorialCargasTendencia
          historial={t.historial}
          cargaEnProceso={t.cargaEnProceso}
          filtro={t.filtro}
          onCambiarFiltro={t.cambiarFiltro}
          rangoAnios={rangoAnios}
          opcionesPeriodo={opcionesPeriodo}
          onCambiarPagina={t.setPagina}
          onPublicar={puedeActualizar ? t.publicar : undefined}
          onDespublicar={puedeActualizar ? t.despublicar : undefined}
          cortesEnAccion={t.cortesEnAccion}
          onEliminar={puedeActualizar ? t.eliminar : undefined}
          cargaEnEliminacion={t.cargaEnEliminacion}
        />
      </div>
    </section>
  );
}

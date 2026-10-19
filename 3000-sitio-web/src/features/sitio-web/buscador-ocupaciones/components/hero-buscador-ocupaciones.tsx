'use client';

import { Suspense, useCallback, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { useBuscadorOcupaciones } from '../hooks/use-buscador-ocupaciones';
import { useDetalleOcupacion } from '../hooks/use-detalle-ocupacion';
import { ModalOcupaciones } from './modal-ocupaciones';
import { ResultadosOcupaciones } from './resultados-ocupaciones';
import { DetalleOcupacion } from './detalle-ocupacion';
import { AZUL_PORTADA, PortadaBuscadorOcupaciones } from './portada-buscador-ocupaciones';

const ETIQUETAS_TIPO: Record<string, string> = {
  cuoc: 'Clasificación Única de Ocupaciones para Colombia',
  cno: 'Clasificación Nacional de Ocupaciones',
};

/** Título del modal de resultados cuando la búsqueda no viene de una clasificación concreta. */
const TITULO_RESULTADOS = 'Clasificación Nacional de Ocupaciones - Buscador de Ocupaciones';

/*
 * Textos del diseño. Puck entrega un campo `richtext` vacío —o ausente, como en una
 * portada guardada antes de que existieran estos campos— como `null`, así que el
 * respaldo va en nodos: el HTML de `defaultProps` se vería con sus etiquetas.
 */
const TITULO_SECCION_POR_DEFECTO = (
  <>
    ¿Sabes qué es una
    <br />
    <strong>ocupación?</strong>
  </>
);
const DESCRIPCION_POR_DEFECTO =
  'Es un conjunto de cargos, empleos u oficios que incluyen categorías homogéneas de funciones, independientemente del lugar o tiempo donde se desarrollen.';
const TEXTO_RECUADRO_POR_DEFECTO = (
  <>
    <em>Explora las ocupaciones clave de los</em> <strong>sectores productivos en Colombia.</strong>
  </>
);

export interface HeroBuscadorOcupacionesProps {
  tituloSeccion?: ReactNode;
  descripcion?: ReactNode;
  /** Texto del recuadro sobre el buscador. Se llama `titulo` desde antes del rediseño. */
  titulo?: ReactNode;
  searchPlaceholder?: string;
  imagenFondo?: string;
  /** 0 (opaca) a 100 (invisible); vacío = 0. */
  transparenciaFondo?: number | '';
  /** Color del recuadro del buscador (antes, del banner azul). */
  colorFondo?: string;
  className?: string;
}

function TituloModal({
  codigoAbierto,
  codigoTitulo,
  nombreTitulo,
}: {
  codigoAbierto: string | null;
  codigoTitulo: string;
  nombreTitulo: string;
}) {
  const searchParams = useSearchParams();
  const etiquetaTipo = ETIQUETAS_TIPO[searchParams.get('tipo') ?? ''];

  if (codigoAbierto) {
    return (
      <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span className="rounded-[8px] bg-white/10 px-2 py-1 font-mono text-sm tabular-nums">
          {codigoTitulo}
        </span>
        <span>{nombreTitulo}</span>
      </span>
    );
  }

  return <span>{etiquetaTipo || TITULO_RESULTADOS}</span>;
}

/**
 * Componente del banner buscador de ocupaciones interactivo para Puck y páginas públicas.
 *
 * Conecta el banner visual con el flujo completo de búsqueda (`useBuscadorOcupaciones`),
 * consulta de detalles (`useDetalleOcupacion`) y diálogo modal con resultados (`ModalOcupaciones`).
 */
export function HeroBuscadorOcupaciones({
  tituloSeccion,
  descripcion,
  titulo,
  searchPlaceholder,
  imagenFondo,
  transparenciaFondo,
  colorFondo,
  className = 'w-full',
}: HeroBuscadorOcupacionesProps) {
  const { resultados, terminoBuscado, loading, consultaRealizada, buscar, limpiar } =
    useBuscadorOcupaciones();
  const {
    codigoAbierto,
    detalle,
    loading: cargandoDetalle,
    abrir,
    cerrar: cerrarDetalle,
  } = useDetalleOcupacion();

  const cerrarTodo = useCallback(() => {
    cerrarDetalle();
    limpiar();
  }, [cerrarDetalle, limpiar]);

  const ocupacionSeleccionada = resultados.find((fila) => fila.codigoOcupacion === codigoAbierto);
  const codigoTitulo = detalle?.codigoOcupacion ?? codigoAbierto ?? '';
  const nombreTitulo = detalle?.nombreOcupacion ?? ocupacionSeleccionada?.nombreOcupacion ?? '';

  return (
    <div className={className}>
      <PortadaBuscadorOcupaciones
        tituloSeccion={tituloSeccion ?? TITULO_SECCION_POR_DEFECTO}
        descripcion={descripcion ?? DESCRIPCION_POR_DEFECTO}
        textoRecuadro={titulo ?? TEXTO_RECUADRO_POR_DEFECTO}
        placeholder={searchPlaceholder || 'Buscar ocupación, código o denominación'}
        imagenFondo={imagenFondo}
        transparenciaFondo={transparenciaFondo}
        colorRecuadro={colorFondo}
        onSearch={buscar}
      />

      <ModalOcupaciones
        abierto={consultaRealizada}
        onCerrar={cerrarTodo}
        claveContenido={codigoAbierto ?? 'resultados'}
        colorAcento={colorFondo || AZUL_PORTADA}
        pantallaCompleta
        antetitulo={codigoAbierto ? 'Ocupación' : 'Resultados de la búsqueda'}
        titulo={
          <Suspense fallback={<span>{TITULO_RESULTADOS}</span>}>
            <TituloModal
              codigoAbierto={codigoAbierto}
              codigoTitulo={codigoTitulo}
              nombreTitulo={nombreTitulo}
            />
          </Suspense>
        }
        pie={
          codigoAbierto ? (
            <button
              type="button"
              onClick={cerrarDetalle}
              className="flex cursor-pointer items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-sm font-medium text-[#001631] transition-colors hover:bg-[#001631]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7DB828]"
            >
              <ArrowLeftIcon aria-hidden="true" className="size-4" />
              Volver a los resultados
            </button>
          ) : undefined
        }
      >
        {codigoAbierto ? (
          <DetalleOcupacion detalle={detalle} loading={cargandoDetalle} />
        ) : (
          <ResultadosOcupaciones
            resultados={resultados}
            termino={terminoBuscado}
            loading={loading}
            onSeleccionar={abrir}
          />
        )}
      </ModalOcupaciones>
    </div>
  );
}

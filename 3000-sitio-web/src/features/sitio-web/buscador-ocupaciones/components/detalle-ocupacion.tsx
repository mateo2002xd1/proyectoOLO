'use client';

import { ChevronDownIcon } from '@heroicons/react/20/solid';
import type { ReactNode } from 'react';
import type { DetalleOcupacion as Detalle, OcupacionRelacionada } from '../types';

interface DetalleOcupacionProps {
  detalle: Detalle | null;
  loading: boolean;
}

/** Lo que se pinta donde la clasificación todavía no tiene tabla de origen. */
const SIN_INFORMACION = 'Sin información disponible.';

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mt-7 first:mt-0">
      <h3 className="flex items-center gap-2.5 text-sm tracking-wide text-[#001631] uppercase">
        <span aria-hidden="true" className="h-4 w-1 shrink-0 rounded-full bg-[#7DB828]" />
        {titulo}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Subtítulo siempre visible: para los apartados cortos de "Ubicación en la estructura". */
function Campo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="rounded-[16px] border border-[#eaecf0] bg-[#f8f9fa] px-4 py-3">
      <h4 className="text-xs tracking-[0.08em] text-[#667085] uppercase">{titulo}</h4>
      <div className="mt-1.5 text-sm text-[#344054]">{children}</div>
    </div>
  );
}

/**
 * Subtítulo plegable: los apartados de "Ampliar información" traen hasta
 * treinta valores cada uno y desplegados obligan a desplazar el diálogo entero
 * para llegar al siguiente. Se usa `<details>` nativo para que el plegado
 * funcione sin estado propio y el navegador ya lo anuncie como tal.
 */
function CampoPlegable({
  titulo,
  cantidad,
  abiertoPorDefecto = false,
  children,
}: {
  titulo: string;
  cantidad?: number;
  abiertoPorDefecto?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={abiertoPorDefecto}
      className="group overflow-hidden rounded-[16px] border border-[#eaecf0] open:bg-[#f8f9fa]"
    >
      {/* `min-h-14` iguala la altura de todos los apartados: el contador mide 32px
          y los apartados que no lo llevan —normas asociadas, correlativa CUOC—
          quedarían más bajos que el resto de la pila. */}
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-2 px-4 py-3 transition-colors hover:bg-[#f8f9fa] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7DB828] focus-visible:ring-inset [&::-webkit-details-marker]:hidden">
        <ChevronDownIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-[#98a2b3] transition-transform group-open:rotate-180"
        />
        <h4 className="flex-1 text-xs tracking-[0.08em] text-[#344054] uppercase">
          {titulo}
        </h4>
        {typeof cantidad === 'number' && cantidad > 0 && (
          // `min-w-10` para que el contador de un dígito y el de tres midan lo
          // mismo: van uno debajo de otro y con el ancho al contenido el borde
          // derecho de la pila queda dentado.
          <span className="inline-flex h-8 min-w-10 items-center justify-center rounded-[16px] bg-[#001631]/8 px-2.5 text-xs text-[#001631] tabular-nums">
            {cantidad}
          </span>
        )}
      </summary>
      <div className="border-t border-[#eaecf0] px-4 py-3 text-sm text-[#344054]">{children}</div>
    </details>
  );
}

function TextoVacio() {
  return <p className="text-sm text-[#98a2b3] italic">{SIN_INFORMACION}</p>;
}

/** Lista con viñeta para textos largos (funciones). */
function ListaTextos({ valores }: { valores: string[] }) {
  if (valores.length === 0) return <TextoVacio />;

  return (
    <ul className="flex flex-col gap-2">
      {valores.map((valor) => (
        <li key={valor} className="flex gap-2.5 text-sm leading-relaxed text-[#344054]">
          <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-[#7DB828]" />
          <span>{valor}</span>
        </li>
      ))}
    </ul>
  );
}

/** Etiquetas para valores cortos y numerosos (denominaciones, habilidades, conocimientos). */
function ListaEtiquetas({ valores }: { valores: string[] }) {
  if (valores.length === 0) return <TextoVacio />;

  return (
    <ul className="flex flex-wrap gap-2">
      {valores.map((valor) => (
        <li
          key={valor}
          className="rounded-[10px] border border-[#eaecf0] bg-white px-2.5 py-1 text-sm text-[#344054]"
        >
          {valor}
        </li>
      ))}
    </ul>
  );
}

function ListaRelacionadas({ valores }: { valores: OcupacionRelacionada[] }) {
  if (valores.length === 0) return <TextoVacio />;

  return (
    <ul className="flex flex-col gap-2">
      {valores.map((relacionada) => (
        <li key={relacionada.codigo} className="flex items-start gap-2.5">
          <span className="mt-0.5 shrink-0 rounded-[8px] bg-[var(--olo-modal-acento,#001631)] px-2 py-1 font-mono text-[11px] text-white tabular-nums">
            {relacionada.codigo}
          </span>
          <span className="text-sm text-[#344054]">{relacionada.nombre}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Vista 2 — detalle de la ocupación.
 *
 * El título (`cod_ocupacion_cno` + `nomb_ocupacion_cno`) lo pinta el encabezado
 * del diálogo; aquí empieza en la descripción.
 *
 * Los cuatro apartados sin tabla de origen —área ocupacional, campo
 * ocupacional, normas asociadas y correlativa CUOC— se muestran con su rótulo y
 * el aviso de que no hay datos, en vez de omitirse: la estructura de la
 * clasificación tiene que verse completa aunque el archivo maestro todavía no
 * la llene, y quien consulta necesita saber que ese apartado existe.
 */
export function DetalleOcupacion({ detalle, loading }: DetalleOcupacionProps) {
  if (loading) {
    return (
      <p className="py-10 text-center text-sm text-[#667085]" aria-live="polite">
        Cargando el detalle de la ocupación…
      </p>
    );
  }

  if (!detalle) {
    return (
      <p className="py-10 text-center text-sm text-[#344054]" aria-live="polite">
        No se pudo cargar el detalle de esta ocupación.
      </p>
    );
  }

  return (
    <div>
      <Seccion titulo="Descripción">
        <p className="text-sm leading-relaxed text-[#344054]">
          {detalle.descripcion || SIN_INFORMACION}
        </p>
      </Seccion>

      <Seccion titulo="Ubicación en la estructura">
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo titulo="Área de desempeño">
            {detalle.areaDesempeno || <TextoVacio />}
          </Campo>
          <Campo titulo="Área ocupacional">
            <TextoVacio />
          </Campo>
          <Campo titulo="Nivel de cualificación">
            {detalle.nivelCualificacion ? (
              <span className="leading-relaxed">{detalle.nivelCualificacion}</span>
            ) : (
              <TextoVacio />
            )}
          </Campo>
          <Campo titulo="Campo ocupacional">
            <TextoVacio />
          </Campo>
        </div>
      </Seccion>

      <Seccion titulo="Ampliar información de la ocupación">
        <div className="flex flex-col gap-2.5">
          <CampoPlegable titulo="Funciones" cantidad={detalle.funciones.length} abiertoPorDefecto>
            <ListaTextos valores={detalle.funciones} />
          </CampoPlegable>

          <CampoPlegable titulo="Normas asociadas">
            <TextoVacio />
          </CampoPlegable>

          <CampoPlegable titulo="Denominaciones" cantidad={detalle.denominaciones.length}>
            <ListaEtiquetas valores={detalle.denominaciones} />
          </CampoPlegable>

          <CampoPlegable
            titulo="Ocupaciones relacionadas"
            cantidad={detalle.ocupacionesRelacionadas.length}
          >
            <ListaRelacionadas valores={detalle.ocupacionesRelacionadas} />
          </CampoPlegable>

          <CampoPlegable titulo="Habilidades" cantidad={detalle.habilidades.length}>
            <ListaEtiquetas valores={detalle.habilidades} />
          </CampoPlegable>

          <CampoPlegable titulo="Conocimientos" cantidad={detalle.conocimientos.length}>
            <ListaEtiquetas valores={detalle.conocimientos} />
          </CampoPlegable>

          <CampoPlegable titulo="Correlativa CUOC">
            <TextoVacio />
          </CampoPlegable>
        </div>
      </Seccion>
    </div>
  );
}

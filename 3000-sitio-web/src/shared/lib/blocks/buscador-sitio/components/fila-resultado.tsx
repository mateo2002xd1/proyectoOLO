import Link from 'next/link';
import { resaltarCoincidenciaTexto } from '@olo/blocks-renderer';
import type { ColoresDeLosResultados } from '../lib/colores';
import type { ResultadoDeBusqueda } from '../types';

/**
 * Cómo se marca lo que coincide. Los colores salen de las variables `--olo-resaltado` y
 * `--olo-texto-resaltado` que pone la sección (ya validadas): así no hace falta una
 * etiqueta `<style>` con el texto que escribió el editor.
 */
const CLASE_DEL_RESALTADO =
  'rounded px-0.5 bg-[color:var(--olo-resaltado)] text-[color:var(--olo-texto-resaltado)]';

const ETIQUETA_POR_TIPO: Record<string, string> = { h1: 'Página', h2: 'Sección' };

/**
 * Un resultado: a la izquierda el tipo, el título y la ruta; a la derecha el fragmento que
 * coincide. Es un solo enlace, y su nombre accesible es su contenido (título, ruta y
 * fragmento), no una etiqueta aparte que lo reemplace.
 */
export function FilaResultado({
  resultado,
  consulta,
  colores,
}: {
  resultado: ResultadoDeBusqueda;
  consulta: string;
  colores: ColoresDeLosResultados;
}) {
  const destino = resultado.blockId ? `${resultado.href}#${resultado.blockId}` : resultado.href;

  return (
    <li style={{ borderColor: colores.bordeTabla }}>
      <Link
        href={destino}
        className="grid w-full grid-cols-1 gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[color:var(--olo-fila-hover)] focus:outline-none focus-visible:bg-[color:var(--olo-fila-hover)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-focus @xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] @xl:gap-4"
      >
        <span className="flex items-start gap-2.5">
          <span
            style={{ backgroundColor: colores.badgeFondo, color: colores.badgeTexto }}
            className="mt-0.5 shrink-0 rounded-[8px] px-2 py-1 font-mono text-[11px] tabular-nums"
          >
            {ETIQUETA_POR_TIPO[resultado.type] ?? 'Contenido'}
          </span>
          <span className="min-w-0">
            <span style={{ color: colores.tituloResultado }} className="block text-sm font-medium">
              {resaltarCoincidenciaTexto(resultado.context, consulta, CLASE_DEL_RESALTADO)}
            </span>
            <span style={{ color: colores.rutaResultado }} className="mt-0.5 block text-sm">
              {resultado.href}
            </span>
          </span>
        </span>

        <span className="min-w-0">
          <span
            style={{ color: colores.rutaResultado }}
            className="mb-1 block text-[11px] uppercase tracking-[0.12em] @xl:hidden"
          >
            Contenido
          </span>
          <span
            style={{ color: colores.textoResultado }}
            className="line-clamp-3 text-sm leading-relaxed"
          >
            {resaltarCoincidenciaTexto(resultado.text, consulta, CLASE_DEL_RESALTADO)}
          </span>
        </span>
      </Link>
    </li>
  );
}

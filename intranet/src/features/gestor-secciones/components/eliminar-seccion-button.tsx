/**
 * Botón para eliminar la sección que se está mirando.
 *
 * Es el reverso de «Nueva sección» y deshace exactamente lo que aquella creó. Aparece
 * solo donde tiene sentido, que es en bastantes menos sitios de los que parece:
 *
 *  - Solo si el rol tiene `secciones.eliminar` (lo resuelve el servidor, en el layout).
 *
 * El slug sale de la ruta y no de una prop porque esto lo monta el layout, que no lo
 * conoce. Se arma igual que en el comodín `[...puckPath]`: uniendo los segmentos con
 * guiones, porque el slug nunca lleva barra.
 *
 * ## Ya no distingue secciones de fábrica
 *
 * Hasta el 2026-09-04 se ocultaba en `inicio`, `tasa`, `matriz`, las encuestas y
 * `menu-y-pie` porque código en otros puntos da por hecho que existen. Se quitó a
 * pedido explícito, con el riesgo aceptado: `menu-y-pie` tiene un *fallback* de
 * código si se borra (`obtenerPlantilla` vuelve a `PLANTILLA_POR_DEFECTO`, no se
 * queda el sitio sin barra ni pie), pero `inicio` y las demás NO tienen uno propio
 * en esta app —a diferencia de sitio-web, que sí tiene `homeFallbackData`— y su ruta
 * simplemente deja de servir contenido hasta que alguien la vuelva a crear. El
 * backend (`eliminar-seccion.usecase.ts`, compartido con sitio-web) ya no rechaza
 * el borrado por este motivo.
 *
 * ## El diálogo pregunta antes de dejar borrar
 *
 * Al abrirse consulta `/eliminable`, que responde qué se perdería y —lo que de verdad
 * decide— si algo del portal enlaza a esta ruta. Si lo hay, no se ofrece confirmación
 * siquiera: se listan los enlaces para que se quiten primero. Es la diferencia entre
 * borrar y dejar el menú apuntando a ninguna parte.
 *
 * Nada de esto es una frontera de seguridad: el servidor vuelve a comprobarlo todo al
 * recibir el DELETE, incluido el nombre tecleado.
 */
'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  analizarEliminacion,
  eliminarSeccion,
  type AnalisisDeEliminacion,
} from '../api/paginas.api';

/** `/encuestas/calidad-de-formacion` → `encuestas-calidad-de-formacion`. */
function slugDeRuta(ruta: string): string {
  return ruta.split('/').filter(Boolean).join('-');
}

export function EliminarSeccionButton({ hasPermission }: { hasPermission: boolean }) {
  const router = useRouter();
  const rutaActual = usePathname();
  const slug = slugDeRuta(rutaActual ?? '');

  const [abierto, setAbierto] = useState(false);
  const [analisis, setAnalisis] = useState<AnalisisDeEliminacion | null>(null);
  const [cargando, setCargando] = useState(false);
  const [confirmacion, setConfirmacion] = useState('');
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Regla §0.11 — sin permiso no se pinta. Y sin slug tampoco: en una ruta rara no hay
  // nada que borrar.
  if (!hasPermission || !slug) return null;

  const abrir = async () => {
    setAbierto(true);
    setCargando(true);
    setError(null);
    setConfirmacion('');
    try {
      setAnalisis(await analizarEliminacion(slug));
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo consultar la sección.');
    } finally {
      setCargando(false);
    }
  };

  const cerrar = () => {
    if (borrando) return;
    setAbierto(false);
    setAnalisis(null);
    setError(null);
  };

  const nombreCoincide =
    analisis != null &&
    confirmacion.trim().toLowerCase() === analisis.titulo.trim().toLowerCase();

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!analisis?.puedeEliminarse || !nombreCoincide || borrando) return;

    setBorrando(true);
    setError(null);
    try {
      await eliminarSeccion(slug, confirmacion.trim());
      // A inicio y no atrás: la ruta de la que venimos acaba de dejar de existir.
      router.push('/inicio');
      router.refresh();
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo eliminar la sección.');
      setBorrando(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="edit-button edit-button--eliminar"
        aria-haspopup="dialog"
        title="Eliminar esta sección del portal"
      >
        <svg
          viewBox="0 0 24 24"
          width={16}
          height={16}
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
        <span>Eliminar sección</span>
      </button>

      {abierto && (
        <div
          className="nueva-seccion-fondo"
          role="dialog"
          aria-modal="true"
          aria-labelledby="eliminar-seccion-titulo"
          onClick={(evento) => {
            if (evento.target === evento.currentTarget) cerrar();
          }}
          onKeyDown={(evento) => {
            if (evento.key === 'Escape') cerrar();
          }}
        >
          <form className="nueva-seccion-caja" onSubmit={enviar}>
            <h2 id="eliminar-seccion-titulo" className="nueva-seccion-titulo">
              Eliminar sección
            </h2>

            {cargando && <p className="nueva-seccion-ruta">Comprobando…</p>}

            {!cargando && analisis && !analisis.puedeEliminarse && (
              <>
                <p className="nueva-seccion-error">
                  Todavía no se puede borrar: hay {analisis.referencias.length} enlace(s)
                  apuntando a <code>/{analisis.slug}</code>.
                </p>
                <ul className="nueva-seccion-notas">
                  {analisis.referencias.map((referencia, indice) => (
                    <li key={`${referencia.slug}-${indice}`}>
                      <strong>{referencia.titulo}</strong>
                      {referencia.texto ? ` → «${referencia.texto}»` : ''}
                    </li>
                  ))}
                </ul>
                <p className="nueva-seccion-ruta">
                  Quítalos primero (los del menú, desde «Editar menú y pie») y vuelve a
                  intentarlo. Así el portal no queda con enlaces a ninguna parte.
                </p>
              </>
            )}

            {!cargando && analisis?.puedeEliminarse && (
              <>
                <p className="nueva-seccion-ruta">
                  Se borrará <strong>{analisis.titulo}</strong> (<code>/{analisis.slug}</code>),
                  sus {analisis.versiones} versión(es) y el permiso para editarla.
                  {analisis.publicada && ' Está publicada ahora mismo.'}
                </p>
                <p className="nueva-seccion-error">Esto no se puede deshacer.</p>

                <label className="nueva-seccion-etiqueta" htmlFor="eliminar-seccion-confirmacion">
                  Escribe «{analisis.titulo}» para confirmar
                </label>
                <input
                  id="eliminar-seccion-confirmacion"
                  className="nueva-seccion-campo"
                  value={confirmacion}
                  onChange={(evento) => setConfirmacion(evento.target.value)}
                  autoFocus
                  disabled={borrando}
                  autoComplete="off"
                />

                <ul className="nueva-seccion-notas">
                  <li>Queda registrado en la bitácora, con quién y cuándo.</li>
                  <li>El historial de lo que pasó en ella no se borra.</li>
                </ul>
              </>
            )}

            {error && <p className="nueva-seccion-error">{error}</p>}

            <div className="nueva-seccion-acciones">
              <button
                type="button"
                onClick={cerrar}
                className="nueva-seccion-boton"
                disabled={borrando}
              >
                {analisis?.puedeEliminarse ? 'Cancelar' : 'Entendido'}
              </button>
              {analisis?.puedeEliminarse && (
                <button
                  type="submit"
                  className="nueva-seccion-boton nueva-seccion-boton--peligro"
                  disabled={borrando || !nombreCoincide}
                >
                  {borrando ? 'Eliminando…' : 'Eliminar'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
}

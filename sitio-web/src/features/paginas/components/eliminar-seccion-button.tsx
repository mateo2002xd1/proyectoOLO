/**
 * Botón para eliminar la página que se está mirando.
 *
 * Es el reverso de «Nueva página» y deshace exactamente lo que aquella creó. Aparece
 * solo donde tiene sentido, que es en bastantes menos sitios de los que parece:
 *
 *  - Solo si el rol tiene `secciones.eliminar`. Se resuelve **en el cliente**, igual
 *    que en `nueva-seccion-button.tsx` y por el mismo motivo: leerlo en el servidor
 *    volvería dinámicas todas las páginas del sitio. Primero filtra la cookie de rol
 *    en seco, y solo a quien la pasa se le consulta `/api/me` — la revisión completa,
 *    incluida la que se repite al recuperar foco, vive en `usePermisoDeSeccion`
 *    (hooks/use-permiso-de-seccion.ts).
 *  - Solo en páginas **creadas desde el editor**. Las de fábrica (`inicio` y
 *    `menu-y-pie`) no se pueden borrar y no se ofrece la acción: un botón que siempre
 *    falla es peor que no tenerlo.
 *
 * El slug sale de la ruta y no de una prop porque esto lo monta el layout público, que
 * no lo conoce.
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
import { esSeccionDeFabrica } from '@/config/puck.config';
import {
  analizarEliminacion,
  eliminarSeccion,
  type AnalisisDeEliminacion,
} from '../services/paginas.service';
import { usePermisoDeSeccion } from '../hooks/use-permiso-de-seccion';

/** Las páginas del sitio cuelgan de la raíz: `/bolsa-de-empleo` → `bolsa-de-empleo`. */
function slugDeRuta(ruta: string): string {
  return ruta.split('/').filter(Boolean).join('-');
}

export function EliminarSeccionButton() {
  const router = useRouter();
  const rutaActual = usePathname();
  const slug = slugDeRuta(rutaActual ?? '');
  const hasPermission = usePermisoDeSeccion('secciones.eliminar');

  const [abierto, setAbierto] = useState(false);
  const [analisis, setAnalisis] = useState<AnalisisDeEliminacion | null>(null);
  const [cargando, setCargando] = useState(false);
  const [confirmacion, setConfirmacion] = useState('');
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Regla §0.11 — sin permiso no se pinta. Y sin slug tampoco: en una ruta rara no hay
  // nada que borrar.
  if (!hasPermission || !slug || esSeccionDeFabrica(slug)) return null;

  const abrir = async () => {
    setAbierto(true);
    setCargando(true);
    setError(null);
    setConfirmacion('');
    try {
      setAnalisis(await analizarEliminacion(slug));
    } catch (fallo) {
      // Axios entierra el mensaje de la API en `response.data.error`.
      const respuesta = (fallo as { response?: { data?: { error?: string } } })?.response;
      setError(respuesta?.data?.error ?? 'No se pudo consultar la página.');
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
      // A la portada y no atrás: la ruta de la que venimos acaba de dejar de existir.
      router.push('/inicio');
      router.refresh();
    } catch (fallo) {
      const respuesta = (fallo as { response?: { data?: { error?: string } } })?.response;
      setError(respuesta?.data?.error ?? 'No se pudo eliminar la página.');
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
        title="Eliminar esta página del portal"
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
        <span>Eliminar página</span>
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
              Eliminar página
            </h2>

            {cargando && <p className="nueva-seccion-ruta">Comprobando…</p>}

            {!cargando && analisis && !analisis.puedeEliminarse && (
              <>
                {analisis.motivo === 'de-fabrica' ? (
                  <p className="nueva-seccion-error">
                    «{analisis.titulo}» es una página del sistema y no se puede eliminar.
                  </p>
                ) : (
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
                      Quítalos primero (los del menú, desde «Menú y pie») y vuelve a
                      intentarlo. Así el portal no queda con enlaces a ninguna parte.
                    </p>
                  </>
                )}
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

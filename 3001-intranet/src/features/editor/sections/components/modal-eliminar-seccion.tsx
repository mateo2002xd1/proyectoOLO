'use client';

import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useCierreAnimado } from '@/shared/lib/modals/use-cierre-animado';
import { poppins } from '@/shared/lib/typography/fonts';
import { MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';
import {
  analizarEliminacion,
  eliminarSeccion,
  type AnalisisDeEliminacion,
} from '../services/secciones.service';

/** «A», «A y B», «A, B y C»: para nombrar páginas y botones dentro de una frase. */
function unirConY(partes: ReactNode[]) {
  return partes.map((parte, indice) => (
    <Fragment key={indice}>
      {indice > 0 && (indice === partes.length - 1 ? ' y ' : ', ')}
      {parte}
    </Fragment>
  ));
}

export interface ModalEliminarSeccionProps {
  slug: string;
  abierto: boolean;
  alCerrar: () => void;
}

export function ModalEliminarSeccion({ slug, abierto, alCerrar }: ModalEliminarSeccionProps) {
  const router = useRouter();
  const [analisis, setAnalisis] = useState<AnalisisDeEliminacion | null>(null);
  const [cargando, setCargando] = useState(false);
  const [confirmacion, setConfirmacion] = useState('');
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Consulta el impacto de borrar la sección al abrir el modal. Marcar «cargando» y
  // guardar el resultado son `setState` dentro de un efecto, pero el dato viene de la
  // API: no puede estar en el estado inicial. Ver §9 de 2-convenciones-del-proyecto.md.
  useEffect(() => {
    if (!abierto || !slug) return;

    let vigente = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargando(true);
    setAnalisis(null);
    setError(null);
    setConfirmacion('');

    analizarEliminacion(slug)
      .then((resultado) => {
        if (vigente) setAnalisis(resultado);
      })
      .catch((fallo) => {
        if (!vigente) return;
        const respuesta = (fallo as { body?: { error?: string }; message?: string })?.body;
        setError(respuesta?.error ?? 'No se pudo consultar la página.');
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [abierto, slug]);

  const { montado, cerrando } = useCierreAnimado(abierto);

  if (!montado) return null;

  const cerrar = () => {
    if (borrando) return;
    // No se vacía aquí: el modal sigue a la vista durante su salida. Lo vacía el
    // efecto de arriba al volver a abrirlo.
    alCerrar();
  };

  const nombreCoincide =
    analisis != null &&
    confirmacion.trim().toLowerCase() === analisis.titulo.trim().toLowerCase();

  // Dónde están los enlaces que bloquean el borrado: en el menú y pie, en otras páginas o en
  // los dos. Deciden el texto de la advertencia.
  const enMenu = analisis?.referencias.some((referencia) => referencia.slug === 'menu-y-pie') ?? false;
  const enOtras = analisis?.referencias.some((referencia) => referencia.slug !== 'menu-y-pie') ?? false;
  // Para el paso a paso: en qué páginas están (sin repetir) y si se habla en plural.
  const paginasConEnlace = [...new Set(analisis?.referencias.map((referencia) => referencia.titulo) ?? [])];
  const varios = (analisis?.referencias.length ?? 0) > 1;
  // Cómo se llama la página del menú y pie, para no nombrarla dos veces en el paso 1.
  const tituloDelMenu = analisis?.referencias.find((referencia) => referencia.slug === 'menu-y-pie')?.titulo;

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!analisis?.puedeEliminarse || !nombreCoincide || borrando) return;

    setBorrando(true);
    setError(null);
    try {
      await eliminarSeccion(slug, confirmacion.trim());
      cerrar();
      router.push('/inicio');
      router.refresh();
    } catch (fallo) {
      const respuesta = (fallo as { body?: { error?: string }; message?: string })?.body;
      setError(respuesta?.error ?? 'No se pudo eliminar la página.');
      setBorrando(false);
    }
  };

  return (
    <div
      className="nueva-seccion-fondo olo-anim-fondo"
      data-cerrando={cerrando || undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="eliminar-seccion-titulo"
      // Cerrar al pulsar fuera, pero solo si el clic empieza en el fondo:
      // arrastrar desde dentro del diálogo hasta soltarlo fuera no debe cerrarlo.
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) cerrar();
      }}
      onKeyDown={(evento) => {
        if (evento.key === 'Escape') cerrar();
      }}
    >
      <form className={`nueva-seccion-caja olo-anim-caja ${poppins.className}`} onSubmit={enviar}>
        <h2 id="eliminar-seccion-titulo" className="nueva-seccion-titulo">
          {analisis ? (
            <>
              {/* Bloqueada, el nombre en el amarillo del mensaje de advertencia (#b48a00):
                  primero hay que seguir sus pasos. Si se puede borrar, en el rojo de peligro
                  (pedido del usuario, 2026-10-15). */}
              ¿Eliminar la página{' '}
              «<span
                className={
                  analisis.puedeEliminarse ? 'nueva-seccion-nombre-peligro' : 'text-[#b48a00]'
                }
              >
                {analisis.titulo}
              </span>»?
            </>
          ) : (
            '¿Eliminar la página?'
          )}
        </h2>

        {cargando && <p className="nueva-seccion-ruta">Comprobando…</p>}

        {/* Bloqueada (pedido del usuario, 2026-10-15): arriba la advertencia, solo qué pasa y
            por qué importa; debajo, fuera de ella, el paso a paso. Así el mensaje no mezcla el
            problema con la solución, y los enlaces se nombran dentro de los pasos, donde hay
            que buscarlos. Advertencia y no error: no se perdió nada. */}
        {!cargando && analisis && !analisis.puedeEliminarse && (
          <>
            {/* El texto del usuario (2026-10-15) para lo de siempre, un enlace del menú. Si
                alguno está dentro de otra página, «el menú principal» no sería verdad: se dice
                dónde, con la misma forma. */}
            <MensajeEstado tipo="advertencia" rol="note" className="mt-4">
              <p className="font-semibold">
                {enOtras ? 'Página en uso en el portal' : 'Página en uso en la navegación'}
              </p>
              <p className="mt-0.5">
                {!enOtras
                  ? 'Esta página está enlazada en el menú principal, desvincula el botón antes de eliminarla para evitar enlaces rotos.'
                  : `Esta página está enlazada ${enMenu ? 'en el menú principal y en otras páginas' : 'desde otras páginas'}, quita esos enlaces antes de eliminarla para evitar enlaces rotos.`}
              </p>
            </MensajeEstado>

            {/* El paso a paso con la redacción del usuario (2026-10-15): dónde ir, qué botón
                buscar y qué borrar, con los nombres de verdad (`titulo` de la página donde está
                el enlace y `texto` del botón). Con varios, en plural y nombrándolos todos. */}
            <p className="mt-5 text-sm font-semibold text-[#001631]">
              {varios ? 'Para quitar los enlaces:' : 'Para quitar el enlace:'}
            </p>
            <ol className="mt-3 space-y-3">
              {[
                // Los del menú y pie se quitan desde el botón «Editar Menú y pie» (pedido del usuario,
                // 2026-10-15); los de otras páginas, en esa página, por su nombre.
                <>
                  {enMenu && (
                    <>
                      Ve al botón de <strong className="font-semibold">«Editar Menú y pie»</strong>
                    </>
                  )}
                  {enMenu && enOtras && ' y '}
                  {enOtras && (
                    <>
                      {enMenu ? 'a ' : 'Ve a '}
                      {unirConY(
                        paginasConEnlace
                          .filter((titulo) => titulo !== tituloDelMenu)
                          .map((titulo) => (
                            <strong key={titulo} className="font-semibold">
                              {titulo}
                            </strong>
                          )),
                      )}
                    </>
                  )}
                  .
                </>,
                <>
                  {varios ? 'Busca los componentes que tienen los botones ' : 'Busca el componente que tiene el botón '}
                  {unirConY(
                    analisis.referencias.map((referencia, indice) => (
                      <span key={`${referencia.slug}-${indice}`}>
                        <strong className="font-semibold">
                          {referencia.texto ? `«${referencia.texto}»` : `que lleva a /${analisis.slug}`}
                        </strong>
                        {paginasConEnlace.length > 1 && ` (en ${referencia.titulo})`}
                      </span>
                    )),
                  )}
                  {/* Dónde buscarlos (pedido del usuario, 2026-10-15). */}
                  {' en el editor.'}
                </>,
                varios
                  ? 'Borra los enlaces asignados en la configuración de los componentes.'
                  : 'Borra el enlace asignado en la configuración del componente.',
              ].map((paso, indice) => (
                <li key={indice} className="flex items-start gap-3 text-sm text-[#001631]">
                  <span
                    aria-hidden="true"
                    className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#001631] text-xs font-semibold text-white"
                  >
                    {indice + 1}
                  </span>
                  <span className="min-w-0 flex-1 pt-0.5">{paso}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-[#4b5563]">
              Cuando completes estos pasos, vuelve a abrir este diálogo para continuar.
            </p>
          </>
        )}

        {!cargando && analisis?.puedeEliminarse && (
          <>
            {analisis.publicada && (
              // En rojo (pedido del usuario, 2026-10-15): al borrarla deja de verse ya, y no
              // tiene vuelta atrás. Deja el mismo aire de antes antes del campo de confirmación.
              <MensajeEstado tipo="error" rol="note" className="mb-5">
                La página está publicada actualmente, si la eliminas, dejará de estar
                visible para el público de inmediato.
              </MensajeEstado>
            )}

            <label className="nueva-seccion-etiqueta" htmlFor="eliminar-seccion-confirmacion">
              Escribe{' '}
              «<span className="nueva-seccion-nombre-peligro">{analisis.titulo}</span>» para
              confirmar
            </label>
            <input
              id="eliminar-seccion-confirmacion"
              className="nueva-seccion-campo nueva-seccion-campo--peligro"
              value={confirmacion}
              onChange={(evento) => setConfirmacion(evento.target.value)}
              autoFocus
              disabled={borrando}
              autoComplete="off"
            />
          </>
        )}

        {error && <p className="nueva-seccion-error">{error}</p>}

        <div className="nueva-seccion-acciones">
          <button
            type="button"
            onClick={cerrar}
            className={analisis?.puedeEliminarse ? 'nueva-seccion-boton' : 'nueva-seccion-boton nueva-seccion-boton--principal'}
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
  );
}

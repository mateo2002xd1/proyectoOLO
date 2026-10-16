'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCierreAnimado } from '@/shared/lib/use-cierre-animado';
import { poppins } from '@/shared/lib/fonts';
import { MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';
import {
  analizarEliminacion,
  eliminarSeccion,
  type AnalisisDeEliminacion,
} from '../services/secciones.service';

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

        {/* Bloqueada: todo va en un mensaje de advertencia, qué pasa, dónde están los enlaces
            y qué hacer (pedido del usuario, 2026-10-15). Advertencia y no error: no se perdió
            nada, solo hay que quitar los enlaces antes. `note`: está fijo desde que se abre. */}
        {!cargando && analisis && !analisis.puedeEliminarse && (
          <MensajeEstado tipo="advertencia" rol="note" className="mt-4">
            <p className="font-semibold">
              Todavía no se puede eliminar:{' '}
              {analisis.referencias.length === 1
                ? 'hay 1 enlace que apunta'
                : `hay ${analisis.referencias.length} enlaces que apuntan`}{' '}
              a <code>/{analisis.slug}</code>.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {analisis.referencias.map((referencia, indice) => (
                <li key={`${referencia.slug}-${indice}`}>
                  <strong>{referencia.titulo}</strong>
                  {referencia.texto ? ` → «${referencia.texto}»` : ''}
                </li>
              ))}
            </ul>
            <p className="mt-3 font-semibold">Qué hacer</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5">
              <li>
                Quita {analisis.referencias.length === 1 ? 'ese enlace' : 'esos enlaces'}. Los del
                menú y el pie se editan desde «Menú y pie».
              </li>
              <li>Vuelve a intentar eliminar la página.</li>
            </ol>
            <p className="mt-2">Así el portal no queda con enlaces que no llevan a ninguna parte.</p>
          </MensajeEstado>
        )}

        {!cargando && analisis?.puedeEliminarse && (
          <>
            {analisis.publicada && (
              <p className="nueva-seccion-ruta nueva-seccion-ruta--aviso">
                La página está publicada actualmente, si la eliminas, dejará de estar
                visible para el público de inmediato.
              </p>
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

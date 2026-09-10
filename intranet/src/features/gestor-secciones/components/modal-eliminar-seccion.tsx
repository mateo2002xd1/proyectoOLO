'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  analizarEliminacion,
  eliminarSeccion,
  type AnalisisDeEliminacion,
} from '../api/paginas.api';

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

  useEffect(() => {
    if (!abierto || !slug) return;

    let vigente = true;
    setCargando(true);
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

  if (!abierto) return null;

  const cerrar = () => {
    if (borrando) return;
    setAnalisis(null);
    setError(null);
    setConfirmacion('');
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
  );
}

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCierreAnimado } from '@/shared/lib/use-cierre-animado';
import { poppins } from '@/shared/lib/fonts';
import {
  slugificar,
  motivoSlugInvalido,
  mensajeDeSlugInvalido,
} from '@olo/slug-policy';
import { crearSeccion } from '../services/secciones.service';
import { enlaceAlEditor } from '../../model/rutas';

export interface ModalNuevaSeccionProps {
  abierto: boolean;
  alCerrar: () => void;
}

export function ModalNuevaSeccion({ abierto, alCerrar }: ModalNuevaSeccionProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = useMemo(() => slugificar(nombre), [nombre]);
  const motivo = useMemo(() => motivoSlugInvalido(slug), [slug]);
  const avisoDeRuta = nombre.trim() && motivo ? mensajeDeSlugInvalido(motivo) : null;

  // El formulario se vacía al abrir y no al cerrar: al cerrar sigue a la vista lo que
  // dura su salida, y se veía el campo quedarse en blanco. Es el ajuste de estado
  // durante el render que recomienda React para «cuando cambia una prop», sin efecto.
  const [estabaAbierto, setEstabaAbierto] = useState(abierto);
  if (abierto !== estabaAbierto) {
    setEstabaAbierto(abierto);
    if (abierto) {
      setNombre('');
      setError(null);
    }
  }

  const { montado, cerrando } = useCierreAnimado(abierto);

  if (!montado) return null;

  const cerrar = () => {
    if (creando) return;
    alCerrar();
  };

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (motivo || creando) return;

    setCreando(true);
    setError(null);

    try {
      const seccion = await crearSeccion(nombre.trim());
      cerrar();
      router.push(
        `${enlaceAlEditor(seccion.slug, seccion.ruta)}&nueva=1`
      );
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo crear la sección.');
      setCreando(false);
    }
  };

  return (
    <div
      className="nueva-seccion-fondo olo-anim-fondo"
      data-cerrando={cerrando || undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="nueva-seccion-titulo"
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
        <h2 id="nueva-seccion-titulo" className="nueva-seccion-titulo">
          Crear nueva página
        </h2>

        <label className="nueva-seccion-etiqueta" htmlFor="nueva-seccion-nombre">
          Nombre de la página
        </label>
        <input
          id="nueva-seccion-nombre"
          className="nueva-seccion-campo"
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          placeholder="Bolsa de empleo"
          maxLength={120}
          autoFocus
          disabled={creando}
          aria-describedby={slug ? 'nueva-seccion-ruta' : undefined}
        />

        {slug && (
          <p id="nueva-seccion-ruta" className="nueva-seccion-ruta">
            Su dirección será <code>/{slug}</code>
          </p>
        )}

        {avisoDeRuta && <p className="nueva-seccion-error">{avisoDeRuta}</p>}
        {error && <p className="nueva-seccion-error">{error}</p>}

        <div className="nueva-seccion-aviso" role="note">
          <svg
            className="nueva-seccion-aviso-icono"
            width="5"
            height="12"
            viewBox="0 0 10 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M0.976562 20.7143H1.95312V13.6607H0.976562C0.437207 13.6607 0 13.2235 0 12.6841V10.3516C0 9.81221 0.437207 9.375 0.976562 9.375H6.44531C6.98467 9.375 7.42188 9.81221 7.42188 10.3516V20.7143H8.39844C8.93779 20.7143 9.375 21.1515 9.375 21.6909V24.0234C9.375 24.5628 8.93779 25 8.39844 25H0.976562C0.437207 25 0 24.5628 0 24.0234V21.6909C0 21.1515 0.437207 20.7143 0.976562 20.7143ZM4.6875 0C2.74585 0 1.17188 1.57397 1.17188 3.51562C1.17188 5.45728 2.74585 7.03125 4.6875 7.03125C6.62915 7.03125 8.20312 5.45728 8.20312 3.51562C8.20312 1.57397 6.6291 0 4.6875 0Z"
              fill="currentColor"
            />
          </svg>
          <p>
            La página se creará en estado borrador privado, NO será pública hasta que
            sea aprobada por el administrador.
          </p>
        </div>

        <div className="nueva-seccion-acciones">
          <button
            type="button"
            onClick={cerrar}
            className="nueva-seccion-boton"
            disabled={creando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="nueva-seccion-boton nueva-seccion-boton--principal"
            disabled={creando || Boolean(motivo)}
          >
            {creando ? 'Creando…' : 'Crear y editar'}
          </button>
        </div>
      </form>
    </div>
  );
}

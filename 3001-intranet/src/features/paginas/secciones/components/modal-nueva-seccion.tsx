'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCierreAnimado } from '@/shared/lib/use-cierre-animado';
import { poppins } from '@/shared/lib/fonts';
import { MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';
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

        <MensajeEstado tipo="info" rol="note" className="mt-4">
          La página se creará en estado borrador, NO será pública hasta que sea
          aprobada por el administrador.
        </MensajeEstado>

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

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
import { enlaceAlEditor, rutaPublicaDeSlug } from '../../model/rutas';

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
        `${enlaceAlEditor(seccion.slug, rutaPublicaDeSlug(seccion.slug))}&nueva=1`
      );
    } catch (fallo) {
      const respuesta = (fallo as { response?: { data?: { error?: string } } })?.response;
      setError(respuesta?.data?.error ?? 'No se pudo crear la página.');
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
      {/* Poppins, como todos los modales del panel y del editor. */}
      <form className={`nueva-seccion-caja olo-anim-caja ${poppins.className}`} onSubmit={enviar}>
        <h2 id="nueva-seccion-titulo" className="nueva-seccion-titulo">
          Nueva página
        </h2>

        <label className="nueva-seccion-etiqueta" htmlFor="nueva-seccion-nombre">
          ¿Cómo se llama?
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
          aria-describedby="nueva-seccion-ruta"
        />

        <p id="nueva-seccion-ruta" className="nueva-seccion-ruta">
          {slug ? (
            <>
              Su dirección será <code>/{slug}</code>
            </>
          ) : (
            'La dirección se genera con el nombre que escribas.'
          )}
        </p>

        {avisoDeRuta && <p className="nueva-seccion-error">{avisoDeRuta}</p>}
        {error && <p className="nueva-seccion-error">{error}</p>}

        <ul className="nueva-seccion-notas">
          <li>
            Se crea vacía y <strong>no se ve hasta que alguien la apruebe</strong>.
          </li>
          <li>
            Podrás editarla tú y quien comparta tu rol, porque los permisos se dan por
            rol.
          </li>
        </ul>

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

/**
 * Botón para crear una página nueva del sitio.
 *
 * Es el gemelo del de la intranet (`intranet/src/features/gestor-secciones/components/
 * nueva-seccion-button.tsx`) y hace lo mismo, pero resuelve el permiso de otra forma
 * — y esa diferencia es deliberada, no una divergencia.
 *
 * ## Por qué el permiso se resuelve en el cliente
 *
 * Aquí el botón lo monta el layout **público**. Si el permiso se resolviera en el
 * servidor, Next tendría que renderizar bajo demanda todas las páginas del sitio,
 * incluidas las que no cambian nunca (`/clasificacion`, `/publicaciones`,
 * `/privacidad`…). Es exactamente el trato que ya documenta `plantilla-edit-button.tsx`
 * y se mantiene: el botón aparece al hidratar, no en el HTML inicial.
 *
 * Va en dos pasos porque `secciones.crear` no está en ninguna cookie:
 *
 *  1. La cookie de rol filtra en seco. A quien visita el sitio sin sesión no se le
 *     pregunta nada a la API — que es la inmensa mayoría de las cargas.
 *  2. Solo a quien pasa ese filtro se le consulta `/auth/me`, que sí sabe las claves.
 *
 * Sin el paso 1 cada visita anónima haría una petición autenticada para acabar
 * recibiendo un 401; sin el paso 2 el botón se le pintaría a Editores que no tienen
 * la clave y responderían 403 al pulsarlo. Los dos pasos, más la revisión al
 * recuperar foco, viven en `usePermisoDeSeccion` (hooks/use-permiso-de-seccion.ts).
 *
 * Esto NO es un control de acceso: quien decide es `POST /api/paginas`, que exige
 * `secciones.crear` sin mirar lo que crea el navegador.
 */
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  slugificar,
  motivoSlugInvalido,
  mensajeDeSlugInvalido,
} from '@olo/slug-policy';
import { crearSeccion } from '../services/paginas.service';
import { enlaceAlEditor, rutaPublicaDeSlug } from '../lib/ruta-de-vuelta';
import { usePermisoDeSeccion } from '../hooks/use-permiso-de-seccion';

export function NuevaSeccionButton() {
  const router = useRouter();
  const puedeCrear = usePermisoDeSeccion('secciones.crear');
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // La misma cuenta que hará el servidor, para que la ruta que se lee sea la de verdad.
  const slug = useMemo(() => slugificar(nombre), [nombre]);
  const motivo = useMemo(() => motivoSlugInvalido(slug), [slug]);

  // Con el campo aún vacío no se avisa de nada: el aviso es para quien escribió algo
  // que no produce una ruta usable, no para quien todavía no ha empezado.
  const avisoDeRuta = nombre.trim() && motivo ? mensajeDeSlugInvalido(motivo) : null;

  if (!puedeCrear) return null;

  const cerrar = () => {
    if (creando) return;
    setAbierto(false);
    setNombre('');
    setError(null);
  };

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (motivo || creando) return;

    setCreando(true);
    setError(null);

    try {
      const seccion = await crearSeccion(nombre.trim());
      router.push(
        `${enlaceAlEditor(seccion.slug, rutaPublicaDeSlug(seccion.slug))}&nueva=1`
      );
    } catch (fallo) {
      // El mensaje de la API es el bueno: distingue «ya existe esa ruta» (409) de
      // «no tienes permiso» (403), y ninguno de los dos se puede adivinar aquí.
      // Axios entierra el de la API en `response.data.error`.
      const respuesta = (fallo as { response?: { data?: { error?: string } } })?.response;
      setError(respuesta?.data?.error ?? 'No se pudo crear la página.');
      setCreando(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="edit-button edit-button--nueva"
        aria-haspopup="dialog"
        title="Crear una página nueva del sitio"
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
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        <span>Nueva página</span>
      </button>

      {abierto && (
        <div
          className="nueva-seccion-fondo"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nueva-seccion-titulo"
          // Cerrar al pulsar fuera, pero solo si el clic empezó y acabó en el fondo:
          // arrastrar desde dentro del diálogo hasta soltarlo fuera no debe cerrarlo.
          onClick={(evento) => {
            if (evento.target === evento.currentTarget) cerrar();
          }}
          onKeyDown={(evento) => {
            if (evento.key === 'Escape') cerrar();
          }}
        >
          <form className="nueva-seccion-caja" onSubmit={enviar}>
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
      )}
    </>
  );
}

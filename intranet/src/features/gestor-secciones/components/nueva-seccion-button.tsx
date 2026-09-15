/**
 * Botón para crear una sección nueva de la intranet.
 *
 * Es la tercera acción flotante, apilada sobre «Editar menú y pie», y la más
 * poderosa de las tres: las otras dos cambian contenido, esta estrena una ruta del
 * portal y una clave de permiso. Por eso pide confirmación en un diálogo en vez de
 * llevar directamente a ningún sitio.
 *
 * ## La ruta se enseña mientras se escribe
 *
 * Quien crea la sección le pone un nombre («Bolsa de empleo») y lo que queda en la
 * URL es un slug (`/bolsa-de-empleo`). Enseñar la conversión en vivo evita la
 * sorpresa de descubrir después que «Encuestas/Calidad» no creó una ruta anidada.
 * El cálculo usa `@olo/slug-policy`, **el mismo paquete que aplica la API**: es una
 * vista previa fiel, no una aproximación. Quien decide sigue siendo el servidor.
 *
 * ## Lo que el diálogo dice en voz alta
 *
 * Dos consecuencias que no se pueden descubrir después:
 *
 *  1. La sección **no se ve hasta que se apruebe**. Nace sin versión publicada, así
 *     que la ruta existe pero está vacía. El enlace ya se puede pegar en el menú;
 *     simplemente no muestra nada todavía.
 *  2. El permiso de editarla se concede **al rol**, no a la persona. Si quien la
 *     crea es «Editor», todos los Editores podrán editarla. Es cómo funciona
 *     `roles_permisos` y callarlo sería repartir acceso a espaldas de quien pulsa.
 */
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  slugificar,
  motivoSlugInvalido,
  mensajeDeSlugInvalido,
} from '@olo/slug-policy';
import { crearSeccion } from '../api/paginas.api';
import { enlaceAlEditor } from '../lib/ruta-de-vuelta';

export function NuevaSeccionButton({ hasPermission }: { hasPermission: boolean }) {
  const router = useRouter();
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

  // Regla §0.11 — sin permiso no se pinta. La comprobación real es del servidor:
  // `POST /api/paginas` exige `secciones.crear` y responde 403 si no lo tiene.
  if (!hasPermission) return null;

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
      // El editor abre con `?nueva=` para poder enseñar el enlace recién creado; la
      // ruta de vuelta es la propia sección, que es donde se querrá mirar al salir.
      router.push(`${enlaceAlEditor(seccion.slug, seccion.ruta)}&nueva=1`);
    } catch (fallo) {
      // El mensaje de la API es el bueno: distingue «ya existe esa ruta» (409) de
      // «no tienes permiso» (403), y ninguno de los dos se puede adivinar aquí.
      setError(fallo instanceof Error ? fallo.message : 'No se pudo crear la sección.');
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
        title="Crear una sección nueva de la intranet"
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
        <span>Nueva sección</span>
      </button>

      {abierto && (
        <div
          className="nueva-seccion-fondo"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nueva-seccion-titulo"
          // Cerrar al pulsar fuera, pero solo si el clic empieza en el fondo:
          // arrastrar desde dentro del diálogo hasta soltarlo fuera no debe cerrarlo.
          // (usamos `onMouseDown`, no `onClick`: si el `mousedown` empieza dentro
          // del diálogo, el `click` resultante puede terminar teniendo como
          // `target` el propio fondo aunque el arrastre haya salido de él).
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) cerrar();
          }}
          onKeyDown={(evento) => {
            if (evento.key === 'Escape') cerrar();
          }}
        >
          <form className="nueva-seccion-caja" onSubmit={enviar}>
            <h2 id="nueva-seccion-titulo" className="nueva-seccion-titulo">
              Nueva sección
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

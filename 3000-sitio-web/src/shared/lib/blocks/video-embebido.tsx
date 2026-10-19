import type { CSSProperties, ReactNode } from 'react';
import { ReproductorDeVideo } from './reproductor-de-video';
import { CapaDeImagenDeFondo, type ImagenDeFondo } from './imagen-de-fondo';

/** Un ID de video de YouTube: 11 caracteres de letras, números, `-` y `_`. */
const ID_DE_YOUTUBE = /^[\w-]{11}$/;

/** Únicos dominios de los que se acepta un enlace. */
const DOMINIOS_DE_YOUTUBE = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

/**
 * El ID del video a partir de lo que se pegó en el editor, o `null` si no es de YouTube.
 *
 * Acepta el ID solo o un enlace de YouTube (`watch?v=`, `youtu.be/`, `/embed/`,
 * `/shorts/`, `/live/`). Más estricto que `extraerYoutubeId` de Recursos visuales, que
 * devuelve el texto tal cual si no lo reconoce: aquí un enlace de otro dominio o algo
 * que no sea un ID válido no pasa. El iframe nunca recibe lo que se pegó, sino una
 * dirección armada con el ID (`urlDeInsercion`).
 */
export function idDeVideoDeYoutube(valor?: string): string | null {
  const limpio = valor?.trim() ?? '';
  if (ID_DE_YOUTUBE.test(limpio)) return limpio;

  let url: URL;
  try {
    url = new URL(limpio);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const dominio = url.hostname.toLowerCase();
  if (!DOMINIOS_DE_YOUTUBE.has(dominio)) return null;

  let id: string | null;
  if (dominio === 'youtu.be') id = url.pathname.split('/')[1] ?? null;
  else if (url.pathname === '/watch') id = url.searchParams.get('v');
  else id = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ?? null;

  return id && ID_DE_YOUTUBE.test(id) ? id : null;
}

export interface VideoEmbebidoProps {
  block: { id: string };
  /** Campos `richtext` de Puck: llegan ya convertidos en nodos. */
  titulo?: ReactNode;
  subtitulo?: ReactNode;
  /** El ID o el enlace de YouTube, tal cual se pegó. */
  video?: string;
  /** Nombre del video para lectores de pantalla (el `title` del iframe). */
  tituloVideo?: string;
  /** Imagen que se ve antes de dar play (`ReproductorDeVideo`). Vacía: el video directo. */
  miniatura?: string;
  colorFondo?: string;
  /** Imagen encima del color de fondo, con su transparencia y repetición. */
  fondo?: ImagenDeFondo;
  esEdicion?: boolean;
}

/**
 * Un video de YouTube dentro de un marco blanco, con un titular encima, sobre un fondo
 * de color.
 *
 * Viene del «Video embebido» de la intranet (`TasaVideo`), sin la descarga y con el
 * video limitado a YouTube. En el sitio publicado, sin un video válido el bloque no se
 * pinta; en el editor deja el aviso de qué falta.
 */
export function VideoEmbebido({
  block,
  titulo,
  subtitulo,
  video,
  tituloVideo,
  miniatura,
  colorFondo,
  fondo,
  esEdicion = false,
}: VideoEmbebidoProps) {
  const id = idDeVideoDeYoutube(video);
  if (!id && !esEdicion) return null;

  const estilo = colorFondo ? ({ '--olo-video-fondo': colorFondo } as CSSProperties) : undefined;

  return (
    <section className="olo-video-embebido olo-con-imagen-de-fondo" style={estilo} data-block-id={block.id}>
      <CapaDeImagenDeFondo fondo={fondo} />
      {(titulo || subtitulo) && (
        <div className="olo-video-embebido__encabezado">
          {titulo && <h2 className="olo-video-embebido__titulo">{titulo}</h2>}
          {subtitulo && <div className="olo-video-embebido__subtitulo">{subtitulo}</div>}
        </div>
      )}

      <div className="olo-video-embebido__marco">
        {id ? (
          <ReproductorDeVideo
            id={id}
            titulo={tituloVideo?.trim() || 'Video'}
            miniatura={miniatura?.trim() || undefined}
            esEdicion={esEdicion}
          />
        ) : (
          <div className="olo-video-embebido__vacio">
            {video?.trim()
              ? 'Ese enlace no es de un video de YouTube. Pega el enlace del video o su ID.'
              : 'Pega en el panel el enlace del video de YouTube o su ID.'}
          </div>
        )}
      </div>
    </section>
  );
}

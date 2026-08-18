'use client';

import { useState } from 'react';
import { resaltar } from './resaltar';

/**
 * Reproductor con lista de videos al lado.
 *
 * Copiado de `intranet/src/shared/lib/blocks/inicio/RecursosVisualesBloque.tsx`
 * para el inicio del sitio web — mismo componente y mismos campos, con las
 * clases propias de este sitio (`olo-recursos-visuales-*`, `rv-*` en
 * `globals.css`).
 *
 * La miniatura se pide a YouTube a partir del identificador cuando no se sube
 * una propia, igual que en la intranet.
 */
export interface VideoRecurso {
  youtubeId?: string;
  titulo?: string;
  canal?: string;
  miniatura?: string;
}

export interface RecursosVisualesBloqueProps {
  block: { id: string };
  titulo?: string;
  videos?: VideoRecurso[];
}

const miniaturaDe = (video: VideoRecurso): string =>
  video.miniatura || `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;

export function RecursosVisualesBloque({
  block,
  titulo = '**Recursos** visuales',
  videos = [],
}: RecursosVisualesBloqueProps) {
  const [indiceActivo, setIndiceActivo] = useState(0);

  const conIdentificador = videos.filter((video) => video.youtubeId);
  if (conIdentificador.length === 0) return null;

  // Si se borra el video que estaba sonando, el índice guardado apunta fuera de
  // la lista. Se acota al pintar en vez de sincronizarlo con un efecto.
  const activo = conIdentificador[Math.min(indiceActivo, conIdentificador.length - 1)];

  return (
    <section className="olo-recursos-visuales" aria-label="Recursos visuales" data-block-id={block.id}>
      <div className="olo-recursos-visuales-inner">
        {titulo && <h2 className="olo-recursos-visuales-title">{resaltar(titulo)}</h2>}

        <div className="olo-recursos-visuales-body">
          <div className="rv-container">
            <div className="rv-player">
              <div className="rv-player-inner">
                <iframe
                  key={activo.youtubeId}
                  className="rv-iframe"
                  src={`https://www.youtube.com/embed/${activo.youtubeId}?autoplay=0`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={activo.titulo || 'Recurso visual'}
                />
              </div>
            </div>

            <div className="rv-playlist">
              {conIdentificador.map((video, indice) => (
                <button
                  key={`${video.youtubeId}-${indice}`}
                  className={`rv-playlist-item${video === activo ? ' rv-playlist-item--active' : ''}`}
                  onClick={() => setIndiceActivo(indice)}
                  type="button"
                >
                  <div className="rv-thumb-wrap">
                    {/* src dinamico y tamano por CSS: next/image exigiria width/height fijos o remotePatterns */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={miniaturaDe(video)} alt={video.titulo ?? ''} className="rv-thumb" />
                    <span className="rv-play-icon" aria-hidden="true">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </div>
                  <div className="rv-meta">
                    <p className="rv-meta-title">{video.titulo}</p>
                    <span className="rv-meta-channel">{video.canal}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

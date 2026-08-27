'use client';

import React, { useState, type ReactNode } from 'react';

/**
 * Reproductor con lista de videos al lado.
 *
 * Es `features/inicio/ui/RecursosVisuales` con los videos sacados a campos: antes
 * estaban escritos dentro del componente, así que añadir uno era tocar código.
 *
 * La miniatura se pide a YouTube a partir del identificador cuando no se sube
 * una propia, que es lo que hacía el componente original y evita tener que subir
 * una imagen por video solo para que la lista no salga vacía.
 */
export interface VideoRecurso {
  youtubeId?: string;
  titulo?: string;
  canal?: string;
  miniatura?: string;
}

export interface RecursosVisualesBloqueProps {
  titulo?: ReactNode;
  videos?: VideoRecurso[];
}

const miniaturaDe = (video: VideoRecurso): string =>
  video.miniatura || `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;

export function RecursosVisualesBloque({
  titulo,
  videos = [],
}: RecursosVisualesBloqueProps) {
  const [indiceActivo, setIndiceActivo] = useState(0);

  const conIdentificador = videos.filter((video) => video.youtubeId);
  if (conIdentificador.length === 0) return null;

  // Si se borra el video que estaba sonando, el índice guardado apunta fuera de
  // la lista. Se acota al pintar en vez de sincronizarlo con un efecto.
  const activo = conIdentificador[Math.min(indiceActivo, conIdentificador.length - 1)];

  return (
    <div className="matriz-section-gray px-4 md:px-8">
      <div className="matriz-content-container-wide max-w-[1200px] mx-auto text-center flex flex-col items-center">
        {titulo && (
          <h2 className="matriz-section-title text-[#041E42] font-bold mb-6">{titulo}</h2>
        )}
        <div className="w-full text-left px-2 md:px-6">
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
    </div>
  );
}

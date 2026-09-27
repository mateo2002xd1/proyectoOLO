'use client';

import { useState, type ReactNode } from 'react';

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
  titulo?: ReactNode;
  canal?: ReactNode;
  miniatura?: string;
}

export interface RecursosVisualesBloqueProps {
  titulo?: ReactNode;
  videos?: VideoRecurso[];
  esEdicion?: boolean;
}

const VIDEOS_EJEMPLO: VideoRecurso[] = [
  {
    youtubeId: 'm1h4tcLAmEk',
    titulo: '#DatoOLO | Con nuestros servicios apoyamos a los colombianos víctimas del conflicto armado en todo el país 🇨🇴',
    canal: '@SENAComunica',
  },
  {
    youtubeId: 'v2imp4BA-Zg',
    titulo: '#DatoOLO | ¡Con nosotros te formas para el éxito!',
    canal: '@SENAComunica',
  },
  {
    youtubeId: 'QjPPzJNR9K0',
    titulo: '#DatoOLO | ¿Ya estás preparado para OLO te Cuenta 🤔?',
    canal: '@SENAComunica',
  },
  {
    youtubeId: 'azV9kvP4ikw',
    titulo: '#DatoOLO | ¡No te pierdas ni un minuto de OLO Te Cuenta!',
    canal: '@SENAComunica',
  },
];

/**
 * Extrae el identificador de 11 caracteres de YouTube a partir de un ID crudo o una URL
 * (youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/..., youtube.com/shorts/...).
 */
export const extraerYoutubeId = (urlOId?: string): string => {
  if (!urlOId || typeof urlOId !== 'string') return '';
  const limpio = urlOId.trim();
  if (/^[\w-]{11}$/.test(limpio)) return limpio;
  const matchV = limpio.match(/[?&]v=([\w-]{11})/);
  if (matchV) return matchV[1];
  const matchShort = limpio.match(/youtu\.be\/([\w-]{11})/);
  if (matchShort) return matchShort[1];
  const matchEmbed = limpio.match(/youtube\.com\/embed\/([\w-]{11})/);
  if (matchEmbed) return matchEmbed[1];
  const matchShorts = limpio.match(/youtube\.com\/shorts\/([\w-]{11})/);
  if (matchShorts) return matchShorts[1];
  return limpio;
};

export const miniaturaDe = (video: VideoRecurso): string => {
  if (video.miniatura) return video.miniatura;
  const ytId = extraerYoutubeId(video.youtubeId);
  if (ytId && /^[\w-]{11}$/.test(ytId)) return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
  return '';
};

export function RecursosVisualesBloque({
  titulo,
  videos = [],
  esEdicion,
}: RecursosVisualesBloqueProps) {
  const [indiceActivo, setIndiceActivo] = useState(0);

  const enEdicion =
    esEdicion ??
    (typeof window !== 'undefined' &&
      (window.location.pathname.includes('/editor') ||
        window.location.pathname.includes('/plantilla') ||
        window.location.pathname.includes('/admin/editor') ||
        window.location.pathname.includes('/admin/plantilla')));

  const configurados = Array.isArray(videos) ? videos : [];
  const validos = configurados.filter(
    (video) => video && (video.youtubeId || video.titulo || video.canal || video.miniatura)
  );

  const usarEjemplo = enEdicion && validos.length === 0;
  const listaVideos = usarEjemplo
    ? VIDEOS_EJEMPLO
    : enEdicion
      ? validos
      : validos.filter((video) => Boolean(extraerYoutubeId(video.youtubeId)));

  if (listaVideos.length === 0 && !enEdicion) return null;

  // Si se borra el video que estaba activo, el índice guardado se acota al límite de la lista
  const indiceSeguro = Math.min(indiceActivo, Math.max(0, listaVideos.length - 1));
  const activo = listaVideos[indiceSeguro] || listaVideos[0];
  const idActivo = extraerYoutubeId(activo?.youtubeId);

  return (
    <div className="matriz-section-gray px-4 md:px-8">
      <div className="matriz-content-container-wide max-w-[1200px] mx-auto text-center flex flex-col items-center">
        {titulo && (
          <h2 className="matriz-section-title text-[#041E42] mb-6">{titulo}</h2>
        )}

        {usarEjemplo && (
          <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 shadow-sm mx-auto">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Vista previa de ejemplo · Añade videos desde el panel lateral derecho</span>
          </div>
        )}

        <div className="w-full text-left px-2 md:px-6">
          <div className="rv-container">
            <div className="rv-player">
              <div className="rv-player-inner">
                {idActivo && /^[\w-]{11}$/.test(idActivo) ? (
                  <iframe
                    key={idActivo}
                    className="rv-iframe"
                    src={`https://www.youtube.com/embed/${idActivo}?autoplay=0`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={typeof activo?.titulo === 'string' ? activo.titulo : 'Recurso visual'}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#001631] text-white p-6 text-center select-none">
                    <div className="w-16 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg mb-3">
                      <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-base mb-1">
                      {activo?.titulo || 'Video pendiente de configurar'}
                    </p>
                    <span className="text-xs text-gray-300 max-w-sm">
                      Ingresa el enlace o identificador de YouTube (11 caracteres) en el panel lateral derecho para reproducir este video
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="rv-playlist" data-puck-overlay-portal={enEdicion ? 'true' : undefined}>
              {listaVideos.map((video, indice) => {
                const thumbSrc = miniaturaDe(video);
                return (
                  <button
                    key={`${video.youtubeId || 'vid'}-${indice}`}
                    className={`rv-playlist-item${indice === indiceSeguro ? ' rv-playlist-item--active' : ''}`}
                    onClick={() => setIndiceActivo(indice)}
                    type="button"
                    style={enEdicion ? { pointerEvents: 'auto' } : undefined}
                  >
                    <div className="rv-thumb-wrap">
                      {/* src dinamico y tamano por CSS: next/image exigiria width/height fijos o remotePatterns */}
                      {thumbSrc ? (
                        <img
                          src={thumbSrc}
                          alt={typeof video.titulo === 'string' ? video.titulo : ''}
                          className="rv-thumb"
                        />
                      ) : (
                        <div className="rv-thumb flex items-center justify-center bg-slate-200 text-slate-400">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      <span className="rv-play-icon" aria-hidden="true">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </div>
                    <div className="rv-meta">
                      <p className="rv-meta-title">
                        {video.titulo || (enEdicion ? <span className="text-gray-400 italic">Video sin título</span> : '')}
                      </p>
                      <span className="rv-meta-channel">
                        {video.canal || (enEdicion ? <span className="text-gray-400">Canal</span> : '')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

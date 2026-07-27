'use client';

import React, { useState } from 'react';

interface VideoItem {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
}

const VIDEOS: VideoItem[] = [
  {
    id: '8j0mvTVQi_Y',
    title: 'OLO Te Cuenta: Tendencias del mercado laboral en Colombia',
    channel: '@SENAComunica',
    thumbnail: '',
  },
  {
    id: '4E7Sci4DAVQ',
    title: 'Conoce qué es, para qué sirve y cómo te beneficia el Observatorio Laboral y Ocupacional (OLO) SENA.',
    channel: '@SENAComunica',
    thumbnail: '',
  },
];

function getThumbnail(video: VideoItem) {
  return video.thumbnail || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
}

export function RecursosVisuales() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = VIDEOS[activeIndex];

  return (
    <div className="rv-container">
      {/* Player */}
      <div className="rv-player">
        <div className="rv-player-inner">
          <iframe
            key={active.id}
            className="rv-iframe"
            src={`https://www.youtube.com/embed/${active.id}?autoplay=0`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={active.title}
          />
        </div>
      </div>

      {/* Playlist */}
      <div className="rv-playlist">
        {VIDEOS.map((video, i) => (
          <button
            key={video.id + i}
            className={`rv-playlist-item${i === activeIndex ? ' rv-playlist-item--active' : ''}`}
            onClick={() => setActiveIndex(i)}
            type="button"
          >
            <div className="rv-thumb-wrap">
              {/* src dinamico y tamano por CSS: next/image exigiria width/height fijos o remotePatterns */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getThumbnail(video)}
                alt={video.title}
                className="rv-thumb"
              />
              {/* play icon overlay */}
              <span className="rv-play-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </div>
            <div className="rv-meta">
              <p className="rv-meta-title">{video.title}</p>
              <span className="rv-meta-channel">{video.channel}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

/** youtube-nocookie: no deja cookies de seguimiento hasta que se da play. */
export const urlDeInsercion = (id: string, reproducir = false) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0${reproducir ? '&autoplay=1' : ''}`;

/**
 * Los atributos que todo iframe de YouTube del sitio necesita, también la «Lista de
 * videos» (`RecursosVisualesBloque`).
 *
 * `referrerPolicy` es el que importa: YouTube exige saber desde qué sitio se inserta el
 * video y, si no le llega, muestra el «Error 153». Puesto en el propio iframe no depende
 * de lo que hagan con esa cabecera el nginx o el túnel del servidor.
 */
export const ATRIBUTOS_DEL_IFRAME_DE_YOUTUBE = {
  loading: 'lazy',
  referrerPolicy: 'strict-origin-when-cross-origin',
  // Lo justo para que el reproductor funcione; sin `allow-top-navigation`,
  // así el video no puede llevarse la página a otro sitio.
  sandbox: 'allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox',
  allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
  allowFullScreen: true,
} as const;

interface ReproductorDeVideoProps {
  /** ID de YouTube ya validado (`idDeVideoDeYoutube`). */
  id: string;
  /** Nombre del video para lectores de pantalla. */
  titulo: string;
  /** Imagen propia que se ve antes de dar play. Sin ella, el iframe va directo. */
  miniatura?: string;
  esEdicion?: boolean;
}

/**
 * El reproductor de YouTube del «Video embebido».
 *
 * Con miniatura, primero se ve la imagen con un botón de reproducir; al pulsarlo se
 * cambia por el iframe, que arranca solo (`autoplay=1`: el clic ya fue la orden de
 * reproducir). Así YouTube no se carga hasta que alguien quiere ver el video. En el
 * editor la miniatura no se cambia por el video: el clic es para seleccionar el bloque.
 */
export function ReproductorDeVideo({ id, titulo, miniatura, esEdicion = false }: ReproductorDeVideoProps) {
  const [reproduciendo, setReproduciendo] = useState(false);

  if (miniatura && !reproduciendo) {
    const contenido = (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element -- la imagen la elige el editor (cualquier URL) y su tamaño va por CSS: next/image exigiría width/height fijos y remotePatterns */}
        <img className="olo-video-embebido__miniatura-imagen" src={miniatura} alt="" />
        <span className="olo-video-embebido__play" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </>
    );

    return esEdicion ? (
      <div className="olo-video-embebido__miniatura">{contenido}</div>
    ) : (
      <button
        type="button"
        className="olo-video-embebido__miniatura"
        aria-label={`Reproducir video: ${titulo}`}
        onClick={() => setReproduciendo(true)}
      >
        {contenido}
      </button>
    );
  }

  return (
    <iframe
      className="olo-video-embebido__video"
      src={urlDeInsercion(id, reproduciendo)}
      title={titulo}
      {...ATRIBUTOS_DEL_IFRAME_DE_YOUTUBE}
    />
  );
}

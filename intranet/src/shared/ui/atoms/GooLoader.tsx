'use client';

import { useId } from 'react';

interface GooLoaderProps {
  label?: string;
}

export function GooLoader({ label }: GooLoaderProps) {
  // useId() genera ids con ":" (p. ej. ":r0:") que rompen `filter: url(#...)`
  // y dejan invisible el contenedor. Sanitizamos a un id válido en CSS.
  const filterId = `goo-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="goo-loader">
      <div className="goo-loader-container" style={{ filter: `url(#${filterId})` }}>
        <div className="goo-loader-dot goo-loader-dot1"></div>
        <div className="goo-loader-dot goo-loader-dot2"></div>
        <div className="goo-loader-dot goo-loader-dot3"></div>
      </div>
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute w-0 h-0"
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId}>
            <feGaussianBlur result="blur" stdDeviation="10" in="SourceGraphic"></feGaussianBlur>
            <feColorMatrix
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -7"
              mode="matrix"
              in="blur"
            ></feColorMatrix>
          </filter>
        </defs>
      </svg>
      {label && <p className="goo-loader-label">{label}</p>}
    </div>
  );
}

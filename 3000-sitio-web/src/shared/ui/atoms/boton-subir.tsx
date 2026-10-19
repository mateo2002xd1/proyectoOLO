'use client';

import { useEffect, useState } from 'react';

/** Píxeles bajados a partir de los que aparece: menos que eso, el principio está a la vista. */
const DESDE = 400;

/**
 * Botón «Subir» de la esquina inferior derecha: aparece al bajar por la página y la
 * lleva al principio. Azul oscuro (#001631) con flecha y texto blancos, como la insignia
 * de fecha de «Últimas publicaciones». Los estilos (`.olo-boton-subir`) están en
 * `globals.css`, que también lo aparta del botón flotante de edición si está.
 *
 * El mismo componente vive en `3001-intranet/src/shared/ui/atoms/boton-subir.tsx`: un
 * cambio aquí va también allí.
 *
 * Oculto no se puede tabular (`visibility: hidden` en el CSS). Al pulsarlo, el foco pasa
 * al principio del contenido: si se quedara en el botón, que se oculta al llegar arriba,
 * el teclado se perdería.
 */
export function BotonSubir() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const revisar = () => setVisible(window.scrollY > DESDE);
    revisar();
    window.addEventListener('scroll', revisar, { passive: true });
    return () => window.removeEventListener('scroll', revisar);
  }, []);

  const subir = () => {
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: sinMovimiento ? 'auto' : 'smooth' });
    const inicio = document.querySelector<HTMLElement>('main') ?? document.querySelector<HTMLElement>('header');
    if (inicio) {
      if (!inicio.hasAttribute('tabindex')) inicio.setAttribute('tabindex', '-1');
      inicio.focus({ preventScroll: true });
    }
  };

  return (
    <button
      type="button"
      className="olo-boton-subir"
      data-visible={visible || undefined}
      // Empieza por «Subir», lo que se lee en el botón: quien lo dicta por voz lo encuentra.
      aria-label="Subir al inicio de la página"
      onClick={subir}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-6 6 6-6 6 6" />
      </svg>
      Subir
    </button>
  );
}

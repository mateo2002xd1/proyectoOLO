/**
 * La figura del icono de accesibilidad, solo los trazos, en `currentColor`. La usan el
 * botón del borde derecho (con su pestaña de fondo) y la cabecera del panel. Coordenadas
 * del diseño original de 56 × 60.
 */
export function TrazosAccesibilidad() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M41.9907 22.9104C34.2627 25.4771 21.7311 25.4771 14 22.9104" />
      <path d="M23.6426 36.244H32.3537" />
      <path d="M32.1469 24.6895V24.8357C32.1469 35.3637 32.1469 39.573 34.222 45.8886" />
      <path d="M23.8509 24.6895V24.8357C23.8509 35.3637 23.8509 39.573 21.7758 45.8886" />
      <path d="M29.0429 14.5102C29.6184 15.0858 29.6184 16.0222 29.0429 16.6009C28.4673 17.1796 27.5309 17.1764 26.9522 16.6009C26.3735 16.0253 26.3767 15.0889 26.9522 14.5102C27.5278 13.9316 28.4642 13.9347 29.0429 14.5102" />
    </g>
  );
}

/** La pestaña del borde derecho: fondo azul institucional con la figura en blanco. */
export function PestanaAccesibilidad() {
  return (
    <svg width="56" height="60" viewBox="0 0 56 60" aria-hidden="true" focusable="false">
      <path
        className="olo-a11y-boton__fondo"
        d="M0 12C0 5.37258 5.37258 0 12 0H55.9907V59.8889H12C5.37257 59.8889 0 54.5163 0 47.8889V12Z"
      />
      <g color="#F1F1F1">
        <TrazosAccesibilidad />
      </g>
    </svg>
  );
}

/** Solo la figura, recortada a su caja, para ponerla sobre un fondo propio. */
export function FiguraAccesibilidad({ className }: { className?: string }) {
  return (
    <svg viewBox="12 11 32 37" className={className} aria-hidden="true" focusable="false">
      <TrazosAccesibilidad />
    </svg>
  );
}

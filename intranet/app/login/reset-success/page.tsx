'use client';

import Link from 'next/link';

export default function ResetSuccessPage() {
  return (
    <div className="rs-page">
      <div className="rs-content">
        <h1 className="rs-title">
          ¡Genial, tu clave ha sido actualizada con éxito!
        </h1>
        <p className="rs-subtitle">
          Ya puedes ingresar a tu cuenta con tu nuevo código de acceso.
        </p>
        <p className="rs-hint">
          ¡Tu seguridad es nuestra prioridad!
        </p>

        <Link href="/login" className="rs-login-btn">
          Iniciar sesión
        </Link>

        <Link href="http://localhost:3000" className="rs-return">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Regresar al sitio web del Observatorio
        </Link>
      </div>
    </div>
  );
}

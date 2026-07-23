'use client';

import React from 'react';

interface IntranetTopbarProps {
  menuItems?: Array<{ label: string; href: string }>;
  brandText?: string;
  logoUrl?: string;
  onLogout?: () => void;
  isLoading?: boolean;
}

export function IntranetTopbar({
  menuItems = [
    { href: "/inicio", label: "Inicio" },
    { href: "/tasa", label: "Tasa de Vinculación y Empleabilidad" },
    { href: "/matriz", label: "Matriz de Pertinencia" },
    { href: "#", label: "Encuestas" },
  ],
  brandText = "Intranet",
  logoUrl = "/assets/svg/olo-logo-blanco.svg",
  onLogout,
  isLoading = false,
}: IntranetTopbarProps) {
  return (
    <header className="intranet-topbar" aria-label="Navegacion principal">
      <div className="intranet-topbar-inner">
        <div className="intranet-brand">
          <img
            src={logoUrl}
            alt="Logo OLO"
            width={22}
            height={22}
          />
          <span className="intranet-brand-text">{brandText}</span>
        </div>

        <nav className="intranet-nav">
          {menuItems.map((item) => (
            <a key={item.label} href={item.href} className="intranet-nav-link">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="intranet-topbar-actions" aria-label="Acciones">
          <button type="button" className="intranet-icon-btn" aria-label="Buscar">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M15.5 15.5L21 21M18 10.5A7.5 7.5 0 1 1 3 10.5a7.5 7.5 0 0 1 15 0Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            className="intranet-login-btn"
            aria-label="Cerrar sesion"
            title="Cerrar sesión"
            onClick={onLogout}
            disabled={isLoading}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
              <path
                d="M15 8l4 4m0 0-4 4m4-4H9m4-9H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

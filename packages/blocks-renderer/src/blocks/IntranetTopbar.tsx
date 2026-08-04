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
    { href: "/intranet", label: "Inicio" },
    { href: "#", label: "Tasa de Vinculación y Empleabilidad" },
    { href: "#", label: "Matriz de Pertinencia" },
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
          <div className="intranet-search-container">
            <svg className="intranet-search-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input
              type="search"
              name="search"
              placeholder="Buscar"
              className="intranet-search-input"
              aria-label="Buscar"
            />
          </div>

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

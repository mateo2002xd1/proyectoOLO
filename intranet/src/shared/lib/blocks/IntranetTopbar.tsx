'use client';

import React from 'react';

interface IntranetTopbarProps {
  menuItems?: Array<{ label: string; href: string; children?: Array<{ label: string; href: string }> }>;
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
    {
      href: "#",
      label: "Encuestas",
      children: [
        { href: "/encuestas/calidad-de-formacion", label: "Calidad de Formación" },
        { href: "/encuestas/seguimiento-laboral", label: "Seguimiento Laboral" }
      ]
    },
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
          {/* src dinamico y tamano por CSS: next/image exigiria width/height fijos o remotePatterns */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
            // `item.children?.length` y no `item.children`: desde el editor los
            // enlaces sin submenú llegan con un array vacío, que es truthy y
            // pintaría la flecha de desplegar sobre un menú sin nada dentro.
            item.children?.length ? (
              <div key={item.label} className="relative group">
                <a href={item.href} className="intranet-nav-link flex items-center gap-1.5 px-4 py-2">
                  {item.label}
                  <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </a>
                <div className="intranet-dropdown-menu">
                  <div className="intranet-dropdown-box">
                    {item.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        className="intranet-dropdown-item"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <a key={item.label} href={item.href} className="intranet-nav-link flex items-center gap-1.5 px-4 py-2">
                {item.label}
              </a>
            )
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
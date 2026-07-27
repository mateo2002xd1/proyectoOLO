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
            item.children ? (
                <div key={item.label} className="relative group">
                  <a href={item.href} className="intranet-nav-link flex items-center gap-1.5">
                    {item.label}
                    <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </a>
                  <div className="absolute left-0 top-full pt-2 w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-[#002240] rounded-lg shadow-xl border border-white/10 overflow-hidden py-2">
                      {item.children.map((child, idx) => (
                        <a 
                          key={child.label} 
                          href={child.href} 
                          className={`flex items-center gap-2 px-4 py-4 text-sm text-white/85 hover:text-white hover:bg-white/10 transition-colors${idx < item.children!.length - 1 ? ' border-b border-white/5' : ''}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0"></span>
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
            ) : (
              <a key={item.label} href={item.href} className="intranet-nav-link">
                {item.label}
              </a>
            )
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

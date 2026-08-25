'use client';

import React, { useEffect, useRef, useState } from 'react';

interface IntranetTopbarProps {
  menuItems?: Array<{ label: string; href: string; children?: Array<{ label: string; href: string }> }>;
  brandText?: string;
  logoUrl?: string;
  /** Vacío usa el navy de `.intranet-topbar` en globals.css. */
  fondo?: string;
  onLogout?: () => void;
  isLoading?: boolean;
}

export function IntranetTopbar({
  fondo,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDropdownOpen) searchInputRef.current?.focus();
  }, [isDropdownOpen]);

  const intranetContent = [
    {
      href: "/inicio",
      items: [
        { type: "h1", text: "Inicio" },
        { type: "p", text: "Página principal de la intranet" }
      ]
    },
    {
      href: "/tasa",
      items: [
        { type: "h1", text: "Tasa de Vinculación y Empleabilidad" },
        { type: "h2", text: "Indicadores Generales" },
        { type: "p", text: "Indicadores y métricas de empleabilidad de nuestros egresados." }
      ]
    },
    {
      href: "/matriz",
      items: [
        { type: "h1", text: "Matriz de Pertinencia" },
        { type: "h2", text: "¿Qué es?" },
        { type: "p", text: "La Matriz de Pertinencia es una herramienta estratégica del SENA, que permite a través de sus 5 variables:" },
        { type: "span", text: "1. vinculación laboral." },
        { type: "span", text: "2. tendencia de las ocupaciones." },
        { type: "span", text: "3. demanda social de los programas de oferta titulada." },
        { type: "span", text: "4. sector estratégico de los programas de formación." },
        { type: "span", text: "5. contrato de aprendizaje; comprender que tan bien se ajustan los programas ofrecidos por los centros de formación a la realidad del mercado laboral colombiano." }
      ]
    },
    {
      href: "/encuestas/calidad-de-formacion",
      items: [
        { type: "h1", text: "Calidad de Formación" },
        { type: "p", text: "Encuestas sobre la calidad de los programas impartidos." }
      ]
    },
    {
      href: "/encuestas/seguimiento-laboral",
      items: [
        { type: "h1", text: "Seguimiento Laboral" },
        { type: "span", text: "Encuestas de seguimiento a egresados en su entorno laboral." }
      ]
    }
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const normalizeText = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredResults: Array<{ href: string, type: string, text: string, context: string }> = [];
  if (searchQuery.trim() !== "") {
    const q = normalizeText(searchQuery);
    intranetContent.forEach(page => {
      page.items.forEach(item => {
        if (normalizeText(item.text).includes(q)) {
          filteredResults.push({
            href: page.href,
            type: item.type,
            text: item.text,
            context: page.items[0].text
          });
        }
      });
    });
  }

  return (
    <header
      className="intranet-topbar"
      aria-label="Navegacion principal"
      style={fondo ? { backgroundColor: fondo } : undefined}
    >
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
          <button
            type="button"
            className={`intranet-search-toggle${isDropdownOpen ? ' is-active' : ''}`}
            aria-label="Buscar"
            aria-expanded={isDropdownOpen}
            onClick={() => setIsDropdownOpen((open) => !open)}
          >
            <svg width={18} height={18} viewBox="0 0 20 20" fill="#ffffff" aria-hidden="true">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
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

      {isDropdownOpen && (
        <div className="intranet-search-modal" onClick={() => setIsDropdownOpen(false)}>
          <div className="intranet-search-modal-inner" onClick={(e) => e.stopPropagation()}>
            <div className="intranet-search-field">
              <svg className="intranet-search-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                name="search"
                placeholder="Buscar"
                className="intranet-search-input"
                aria-label="Buscar"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <div className="intranet-search-results">
              {searchQuery.trim() === "" ? (
                <div className="intranet-search-empty">Escribe para buscar en la intranet</div>
              ) : filteredResults.length > 0 ? (
                filteredResults.map((result, idx) => (
                  <a key={idx} href={result.href} className="intranet-search-result-item block text-inherit no-underline">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{result.context}</span>
                      {result.type === 'h1' && <h1 className="intranet-search-result-title text-lg font-bold">{result.text}</h1>}
                      {result.type === 'h2' && <h2 className="intranet-search-result-title text-base font-semibold">{result.text}</h2>}
                      {result.type === 'p' && <p className="intranet-search-result-desc text-sm">{result.text}</p>}
                      {result.type === 'span' && <span className="intranet-search-result-desc text-xs text-gray-300">{result.text}</span>}
                    </div>
                  </a>
                ))
              ) : (
                <div className="intranet-search-result-item text-gray-500 text-sm">
                  No se encontraron resultados
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
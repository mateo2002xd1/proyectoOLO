'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';

import {
  obtenerIndiceBusqueda,
  type PaginaIndiceBusqueda,
  type ItemTextoBusqueda,
} from '@/features/gestor-secciones/api/paginas.api';
import { desplazarAElemento, resaltarCoincidenciaTexto } from '@olo/blocks-renderer';

/** Valores de Puck para `justify-content`/`align-items` dentro de `.intranet-brand`. */
type AlineacionFlex = 'flex-start' | 'center' | 'flex-end';

interface IntranetTopbarProps {
  menuItems?: Array<{ label?: React.ReactNode; href?: string; children?: Array<{ label?: React.ReactNode; href?: string }> }>;
  brandText?: React.ReactNode;
  /** Posición del logo + texto dentro de su contenedor. Por defecto, el
   *  layout de siempre: pegado a la izquierda y centrado verticalmente. */
  alineacionMarca?: { horizontal?: AlineacionFlex; vertical?: AlineacionFlex };
  logoUrl?: string;
  /** Vacío usa el navy de `.intranet-topbar` en globals.css. */
  fondo?: string;
  onLogout?: () => void;
  isLoading?: boolean;
}

const INTRANET_ESTATICO_FALLBACK: Array<{
  href: string;
  titulo?: string;
  items: ItemTextoBusqueda[];
}> = [
  {
    href: '/inicio',
    titulo: 'Inicio',
    items: [
      { type: 'h1', text: 'Inicio' },
      { type: 'p', text: 'Página principal de la intranet' },
    ],
  },
  {
    href: '/tasa',
    titulo: 'Tasa de Vinculación y Empleabilidad',
    items: [
      { type: 'h1', text: 'Tasa de Vinculación y Empleabilidad' },
      { type: 'h2', text: 'Indicadores Generales' },
      { type: 'p', text: 'Indicadores y métricas de empleabilidad de nuestros egresados.' },
    ],
  },
  {
    href: '/matriz',
    titulo: 'Matriz de Pertinencia',
    items: [
      { type: 'h1', text: 'Matriz de Pertinencia' },
      { type: 'h2', text: '¿Qué es?' },
      {
        type: 'p',
        text: 'La Matriz de Pertinencia es una herramienta estratégica del SENA, que permite a través de sus 5 variables:',
      },
      { type: 'span', text: '1. vinculación laboral.' },
      { type: 'span', text: '2. tendencia de las ocupaciones.' },
      { type: 'span', text: '3. demanda social de los programas de oferta titulada.' },
      { type: 'span', text: '4. sector estratégico de los programas de formación.' },
      {
        type: 'span',
        text: '5. contrato de aprendizaje; comprender que tan bien se ajustan los programas ofrecidos por los centros de formación a la realidad del mercado laboral colombiano.',
      },
    ],
  },
  {
    href: '/encuestas/calidad-de-formacion',
    titulo: 'Calidad de Formación',
    items: [
      { type: 'h1', text: 'Calidad de Formación' },
      { type: 'p', text: 'Encuestas sobre la calidad de los programas impartidos.' },
    ],
  },
  {
    href: '/encuestas/seguimiento-laboral',
    titulo: 'Seguimiento Laboral',
    items: [
      { type: 'h1', text: 'Seguimiento Laboral' },
      { type: 'span', text: 'Encuestas de seguimiento a egresados en su entorno laboral.' },
    ],
  },
];

export function IntranetTopbar({
  fondo,
  alineacionMarca,
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
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [activo, setActivo] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (isDropdownOpen) searchInputRef.current?.focus();
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo || '';
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    listaRef.current
      ?.querySelector('[data-activo="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [activo]);

  const [indiceDinamico, setIndiceDinamico] = useState<PaginaIndiceBusqueda[] | null>(null);

  useEffect(() => {
    let activo = true;
    obtenerIndiceBusqueda()
      .then((datos) => {
        if (activo && datos && datos.length > 0) {
          setIndiceDinamico(datos);
        }
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  // Desplazar y resaltar automáticamente si la URL viene con ?resaltar=... o #blockId
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const texto = params.get('resaltar');
    const hash = window.location.hash ? window.location.hash.slice(1) : undefined;

    if (!texto && !hash) return;

    let cancelado = false;
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;

    const intentar = () => {
      if (cancelado) return;
      const exito = desplazarAElemento({
        blockId: hash || undefined,
        texto: texto || undefined,
      });

      if (exito) {
        clearTimeout(t2);
        clearTimeout(t3);
        if (texto) {
          const url = new URL(window.location.href);
          url.searchParams.delete('resaltar');
          window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        }
      }
      return exito;
    };

    t1 = setTimeout(intentar, 90);
    t2 = setTimeout(intentar, 350);
    t3 = setTimeout(intentar, 750);

    return () => {
      cancelado = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  const contenidoParaBuscar =
    indiceDinamico && indiceDinamico.length > 0
      ? indiceDinamico
      : INTRANET_ESTATICO_FALLBACK;

  // `.intranet-brand` es `inline-flex` (ancho justo al contenido) — sin
  // `minWidth` la alineación horizontal no tiene dónde moverse. Ese `minWidth`
  // solo se aplica si alguien elige algo distinto de "Izquierda", para que las
  // páginas ya guardadas (sin este campo) sigan viéndose pixel-igual que hoy.
  const horizontalMarca = alineacionMarca?.horizontal ?? 'flex-start';
  const verticalMarca = alineacionMarca?.vertical ?? 'center';
  const estiloMarca: React.CSSProperties = { alignItems: verticalMarca };
  if (horizontalMarca !== 'flex-start') {
    estiloMarca.justifyContent = horizontalMarca;
    estiloMarca.minWidth = '180px';
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setActivo(0);
  };

  const cerrarBuscador = useCallback(() => {
    document.body.style.overflow = '';
    setIsDropdownOpen(false);
    setSearchQuery('');
    setActivo(0);
  }, []);

  const irA = useCallback(
    (href: string, blockId?: string, texto?: string) => {
      // 1. Restaurar scroll del body, limpiar filtro de búsqueda y cerrar el modal
      document.body.style.overflow = '';
      setIsDropdownOpen(false);
      setSearchQuery('');
      setActivo(0);

      if (typeof window === 'undefined') {
        router.push(href);
        return;
      }

      // Normalizar rutas (ej. '/' y '/inicio' apuntan a la misma página principal)
      const limpiarRuta = (r: string) => {
        const limpia = (r || '').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
        return limpia === '/inicio' ? '/' : limpia;
      };

      const rutaActual = limpiarRuta(window.location.pathname);
      const rutaDestino = limpiarRuta(href);

      // Si ya estamos en la misma página, desplazarse de inmediato sin recarga
      if (rutaActual === rutaDestino) {
        setTimeout(() => {
          desplazarAElemento({ blockId, texto });
        }, 50);
        return;
      }

      // Si es una página distinta, navegar pasando el anchor y el texto
      const url = new URL(href, window.location.origin);
      if (blockId) {
        url.hash = blockId;
      }
      if (texto) {
        url.searchParams.set('resaltar', texto.slice(0, 60));
      }

      router.push(url.pathname + url.search + url.hash);
    },
    [router]
  );

  const alPulsarTecla = (evento: React.KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      cerrarBuscador();
      return;
    }
    if (filteredResults.length === 0) return;

    if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      setActivo((i) => (i + 1) % filteredResults.length);
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      setActivo((i) => (i - 1 + filteredResults.length) % filteredResults.length);
    } else if (evento.key === 'Enter') {
      evento.preventDefault();
      const seleccionado = filteredResults[activo];
      if (seleccionado) {
        irA(seleccionado.href, seleccionado.blockId, seleccionado.text);
      }
    }
  };

  const normalizeText = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredResults: Array<{
    href: string;
    type: string;
    text: string;
    context: string;
    blockId?: string;
  }> = [];
  if (searchQuery.trim() !== "") {
    const q = normalizeText(searchQuery).replace(/[\s\u00A0]+/g, ' ').trim();
    const palabrasQ = q.split(' ').filter((p) => p.length >= 2);
    contenidoParaBuscar.forEach((page) => {
      const contexto = page.titulo || page.items[0]?.text || "Intranet";
      page.items.forEach((item) => {
        const itemNorm = normalizeText(item.text).replace(/[\s\u00A0]+/g, ' ');
        const contextoNorm = normalizeText(contexto);
        const coincide =
          itemNorm.includes(q) ||
          contextoNorm.includes(q) ||
          (palabrasQ.length > 1 && palabrasQ.every((p) => itemNorm.includes(p) || contextoNorm.includes(p)));

        if (coincide) {
          filteredResults.push({
            href: page.href,
            type: item.type,
            text: item.text,
            context: contexto,
            blockId: item.blockId,
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
        <div className="intranet-brand" style={estiloMarca}>
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

        <nav className={`intranet-nav ${isMobileMenuOpen ? 'is-open' : ''}`}>
          {menuItems.map((item, index) => (
            // `item.children?.length` y no `item.children`: desde el editor los
            // enlaces sin submenú llegan con un array vacío, que es truthy y
            // pintaría la flecha de desplegar sobre un menú sin nada dentro.
            item.children?.length ? (
              <div key={typeof item.label === 'string' ? `${item.label}-${index}` : `nav-${index}`} className="relative group w-full lg:w-auto">
                <a 
                  href={item.href} 
                  className="intranet-nav-link flex items-center justify-between lg:justify-start gap-1.5 px-4 py-3 lg:py-2 w-full"
                  onClick={(e) => {
                    if (item.href === "#" || !item.href) {
                      e.preventDefault();
                    }
                  }}
                >
                  {item.label}
                  <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </a>
                <div className="intranet-dropdown-menu">
                  <div className="intranet-dropdown-box">
                    {item.children.map((child, childIndex) => (
                      <a
                        key={typeof child.label === 'string' ? `${child.label}-${childIndex}` : `child-${childIndex}`}
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
              <a key={typeof item.label === 'string' ? `${item.label}-${index}` : `nav-${index}`} href={item.href} className="intranet-nav-link flex items-center gap-1.5 px-4 py-3 lg:py-2 w-full lg:w-auto">
                {item.label}
              </a>
            )
          ))}
        </nav>

        <div className="intranet-topbar-actions" aria-label="Acciones">
          <button
            type="button"
            className="intranet-mobile-menu-trigger"
            aria-label="Menú"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>

          <button
            type="button"
            className={`intranet-search-toggle${isDropdownOpen ? ' is-active' : ''}`}
            aria-label="Buscar"
            aria-expanded={isDropdownOpen}
            onClick={() => {
              if (isDropdownOpen) {
                cerrarBuscador();
              } else {
                setIsDropdownOpen(true);
              }
            }}
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
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Buscar en la intranet"
          className="fixed inset-0 z-50 h-[100dvh] w-screen overflow-y-auto bg-[#001631]/95 backdrop-blur-md"
          // Usamos `onMouseDown` y no `onClick`: si el usuario selecciona texto en
          // el buscador y suelta el ratón fuera, el clic se contabiliza en el
          // fondo y el buscador se cerraba en mitad de la selección.
          onMouseDown={cerrarBuscador}
        >
          <button
            type="button"
            onClick={cerrarBuscador}
            aria-label="Cerrar el buscador"
            className="absolute top-4 right-6 sm:right-12 rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <XMarkIcon className="size-6" />
          </button>

          <div
            className="mx-auto flex w-full max-w-2xl flex-col px-4 pt-20 pb-20 sm:pt-28"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <label htmlFor="buscador-intranet" className="sr-only">
              Buscar en la intranet
            </label>

            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-5 size-6 -translate-y-1/2 text-white/50" />
              <input
                ref={searchInputRef}
                id="buscador-intranet"
                type="search"
                role="combobox"
                aria-expanded={filteredResults.length > 0}
                aria-controls="buscador-intranet-resultados"
                aria-activedescendant={
                  filteredResults[activo] ? `intranet-opcion-${activo}` : undefined
                }
                aria-autocomplete="list"
                autoComplete="off"
                placeholder="Buscar en la intranet…"
                className="h-16 w-full rounded-[16px] border border-white/20 bg-white/10 pr-5 pl-14 text-lg text-white shadow-sm transition-colors outline-none placeholder:text-white/50 focus:border-transparent focus:ring-2 focus:ring-sky-400"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={alPulsarTecla}
              />
            </div>

            <p aria-live="polite" className="sr-only">
              {filteredResults.length === 0
                ? 'Sin resultados'
                : `${filteredResults.length} ${filteredResults.length === 1 ? 'resultado' : 'resultados'}`}
            </p>

            {searchQuery.trim() === '' ? (
              <p className="mt-8 text-center text-sm text-white/60">
                Escribe para buscar en la intranet…
              </p>
            ) : filteredResults.length === 0 ? (
              <p className="mt-8 text-center text-sm text-white/60">
                No hay nada en la intranet que coincida con «{searchQuery.trim()}».
              </p>
            ) : (
              <ul
                ref={listaRef}
                id="buscador-intranet-resultados"
                role="listbox"
                aria-label="Resultados"
                className="mt-6 max-h-[50vh] space-y-1 overflow-y-auto"
              >
                {filteredResults.slice(0, 25).map((result, idx) => {
                  const seleccionado = idx === activo;
                  return (
                    <li
                      key={idx}
                      id={`intranet-opcion-${idx}`}
                      role="option"
                      aria-selected={seleccionado}
                      data-activo={seleccionado}
                      onMouseEnter={() => setActivo(idx)}
                      className={`rounded-[16px] transition-colors ${
                        seleccionado ? 'bg-white/15' : 'hover:bg-white/10'
                      }`}
                    >
                      <a
                        href={result.href}
                        tabIndex={-1}
                        onClick={(e) => {
                          e.preventDefault();
                          irA(result.href, result.blockId, result.text);
                        }}
                        className="block px-4 py-3 no-underline text-inherit cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] tracking-wider text-sky-400 uppercase">
                            {resaltarCoincidenciaTexto(result.context, searchQuery)}
                          </span>
                          <span className="text-[10px] text-white/50 px-1.5 py-0.5 rounded bg-white/10">
                            {result.type === 'h1'
                              ? 'Página'
                              : result.type === 'h2'
                                ? 'Sección'
                                : 'Contenido'}
                          </span>
                        </div>
                        {result.type === 'h1' || result.type === 'h2' ? (
                          <span className="block text-base text-white leading-snug">
                            {resaltarCoincidenciaTexto(result.text, searchQuery)}
                          </span>
                        ) : (
                          <p className="block text-sm font-normal text-white/80 line-clamp-2 leading-relaxed">
                            {resaltarCoincidenciaTexto(result.text, searchQuery)}
                          </p>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
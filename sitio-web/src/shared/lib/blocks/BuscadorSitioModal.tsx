'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { resaltarCoincidenciaTexto } from '@olo/blocks-renderer';
import type { PaginaIndiceBusqueda, ResultadoBusqueda } from '@/features/paginas';

export interface BuscadorSitioModalProps {
  isOpen: boolean;
  onClose: () => void;
  indice: PaginaIndiceBusqueda[];
  onNavigate: (href: string, blockId?: string, texto?: string) => void;
}

const normalizeText = (text: string) =>
  (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export function BuscadorSitioModal({
  isOpen,
  onClose,
  indice,
  onNavigate,
}: BuscadorSitioModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activo, setActivo] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo || '';
    };
  }, [isOpen]);

  useEffect(() => {
    listaRef.current
      ?.querySelector('[data-activo="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [activo]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setActivo(0);
  };

  const handleCerrar = useCallback(() => {
    setSearchQuery('');
    setActivo(0);
    onClose();
  }, [onClose]);

  const filteredResults: ResultadoBusqueda[] = [];
  if (searchQuery.trim() !== '') {
    const q = normalizeText(searchQuery).replace(/[\s\u00A0]+/g, ' ').trim();
    const palabrasQ = q.split(' ').filter((p) => p.length >= 2);

    indice.forEach((page) => {
      const contexto = page.titulo || page.items[0]?.text || 'Observatorio';
      page.items.forEach((item) => {
        const itemNorm = normalizeText(item.text).replace(/[\s\u00A0]+/g, ' ');
        const contextoNorm = normalizeText(contexto);
        const coincide =
          itemNorm.includes(q) ||
          contextoNorm.includes(q) ||
          (palabrasQ.length > 1 &&
            palabrasQ.every((p) => itemNorm.includes(p) || contextoNorm.includes(p)));

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

  const alPulsarTecla = (evento: React.KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      handleCerrar();
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
        onNavigate(seleccionado.href, seleccionado.blockId, seleccionado.text);
        handleCerrar();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscar en el sitio web"
      className="fixed inset-0 z-50 h-[100dvh] w-screen overflow-y-auto bg-[#001631]/95 backdrop-blur-md"
      onClick={handleCerrar}
    >
      <button
        type="button"
        onClick={handleCerrar}
        aria-label="Cerrar el buscador"
        className="absolute top-4 right-6 sm:right-12 rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 cursor-pointer"
      >
        <XMarkIcon className="size-6" />
      </button>

      <div
        className="mx-auto flex w-full max-w-2xl flex-col px-4 pt-20 pb-20 sm:pt-28"
        onClick={(e) => e.stopPropagation()}
      >
        <label htmlFor="buscador-sitio" className="sr-only">
          Buscar en el sitio web
        </label>

        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-5 size-6 -translate-y-1/2 text-white/50" />
          <input
            ref={searchInputRef}
            id="buscador-sitio"
            type="search"
            role="combobox"
            aria-expanded={filteredResults.length > 0}
            aria-controls="buscador-sitio-resultados"
            aria-activedescendant={
              filteredResults[activo] ? `sitio-opcion-${activo}` : undefined
            }
            aria-autocomplete="list"
            autoComplete="off"
            placeholder="Buscar en el sitio web…"
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
            Escribe para buscar en el sitio web…
          </p>
        ) : filteredResults.length === 0 ? (
          <p className="mt-8 text-center text-sm text-white/60">
            No hay nada en el sitio web que coincida con «{searchQuery.trim()}».
          </p>
        ) : (
          <ul
            ref={listaRef}
            id="buscador-sitio-resultados"
            role="listbox"
            aria-label="Resultados"
            className="mt-6 max-h-[50vh] space-y-1 overflow-y-auto"
          >
            {filteredResults.slice(0, 25).map((result, idx) => {
              const seleccionado = idx === activo;
              return (
                <li
                  key={idx}
                  id={`sitio-opcion-${idx}`}
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
                      onNavigate(result.href, result.blockId, result.text);
                      handleCerrar();
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
  );
}

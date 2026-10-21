'use client';

import React, { useEffect, useRef, useState } from 'react';
import { resaltarCoincidenciaTexto } from '@olo/blocks-renderer';
import type { PaginaIndiceBusqueda, ResultadoBusqueda } from '@/features/editor';

export interface BuscadorSitioProps {
  abierto: boolean;
  onAbrir: () => void;
  onCerrar: () => void;
  indice: PaginaIndiceBusqueda[];
  onNavigate: (href: string, blockId?: string, texto?: string) => void;
}

const normalizeText = (text: string) =>
  (text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/* El resaltado por defecto de `resaltarCoincidenciaTexto` es para fondo oscuro (el
   modal de antes); la lista ahora va sobre blanco. */
const RESALTADO = 'bg-sky-100 text-[#002237] px-0.5 rounded font-semibold not-italic';

function buscar(indice: PaginaIndiceBusqueda[], consulta: string): ResultadoBusqueda[] {
  const resultados: ResultadoBusqueda[] = [];
  if (consulta.trim() === '') return resultados;

  const q = normalizeText(consulta).replace(/[\s ]+/g, ' ').trim();
  const palabrasQ = q.split(' ').filter((p) => p.length >= 3);

  // Construir regex de frase difusa una sola vez (permite puntuación entre palabras)
  // Ej.: buscar "Aprendizaje SENA" encuentra "Aprendizaje (SENA)" en el texto.
  let reFraseDifusa: RegExp | null = null;
  if (q.includes(' ')) {
    const palabrasQ2 = q.split(' ').filter((p) => p.length >= 2);
    if (palabrasQ2.length >= 2) {
      try {
        const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        reFraseDifusa = new RegExp(palabrasQ2.map(escapeRe).join('[\\s\\W]*'));
      } catch { /* ignorar */ }
    }
  }

  indice.forEach((page) => {
    const contexto = page.titulo || page.items[0]?.text || 'Observatorio';
    const contextoNorm = normalizeText(contexto);
    page.items.forEach((item) => {
      const itemNorm = normalizeText(item.text).replace(/[\s ]+/g, ' ');
      const coincide =
        // 1. Frase exacta normalizada
        itemNorm.includes(q) ||
        contextoNorm.includes(q) ||
        // 1.5. Frase difusa: tolera paréntesis y signos entre palabras
        (reFraseDifusa !== null && (reFraseDifusa.test(itemNorm) || reFraseDifusa.test(contextoNorm))) ||
        // 2. Todas las palabras significativas (>= 3 chars) presentes en el item o contexto
        (palabrasQ.length > 1 &&
          palabrasQ.every((p) => itemNorm.includes(p) || contextoNorm.includes(p)));

      if (coincide) {
        resultados.push({
          href: page.href,
          type: item.type,
          text: item.text,
          context: contexto,
          blockId: item.blockId,
        });
      }
    });
  });
  return resultados;
}

/**
 * Buscador de la cabecera: la lupa despliega hacia la izquierda un campo blanco (la
 * lupa queda a su derecha) y los resultados cuelgan debajo. Antes abría un modal a
 * pantalla completa. Se cierra con Escape, al tocar fuera o al elegir un resultado.
 */
export function BuscadorSitio({ abierto, onAbrir, onCerrar, indice, onNavigate }: BuscadorSitioProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activo, setActivo] = useState(0);
  const raizRef = useRef<HTMLDivElement>(null);
  const campoRef = useRef<HTMLInputElement>(null);
  const lupaRef = useRef<HTMLButtonElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);

  // La búsqueda se vacía al abrir y no al cerrar: al cerrar, la lista se desvanece con
  // lo que tenía. Es el ajuste de estado durante el render que recomienda React.
  const [estabaAbierto, setEstabaAbierto] = useState(abierto);
  if (abierto !== estabaAbierto) {
    setEstabaAbierto(abierto);
    if (abierto) {
      setSearchQuery('');
      setActivo(0);
    }
  }

  useEffect(() => {
    if (abierto) campoRef.current?.focus({ preventScroll: true });
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    function alTocarFuera(evento: PointerEvent) {
      if (!raizRef.current?.contains(evento.target as Node)) onCerrar();
    }
    document.addEventListener('pointerdown', alTocarFuera);
    return () => document.removeEventListener('pointerdown', alTocarFuera);
  }, [abierto, onCerrar]);

  useEffect(() => {
    listaRef.current
      ?.querySelector('[data-activo="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [activo]);

  const filteredResults = buscar(indice, searchQuery);
  const hayConsulta = searchQuery.trim() !== '';

  const elegir = (resultado: ResultadoBusqueda) => {
    onNavigate(resultado.href, resultado.blockId, searchQuery.trim() || resultado.text);
    onCerrar();
  };

  const cerrarYVolverALaLupa = () => {
    onCerrar();
    lupaRef.current?.focus();
  };

  // Abierto, la lupa hace de «buscar»: lleva al resultado marcado; sin nada escrito, cierra.
  const alPulsarLupa = () => {
    if (!abierto) {
      onAbrir();
      return;
    }
    const seleccionado = filteredResults[activo];
    if (seleccionado) elegir(seleccionado);
    else if (!hayConsulta) cerrarYVolverALaLupa();
    else campoRef.current?.focus();
  };

  const alPulsarTecla = (evento: React.KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      cerrarYVolverALaLupa();
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
      if (seleccionado) elegir(seleccionado);
    }
  };

  return (
    <div ref={raizRef} className="olo-buscador" data-abierto={abierto || undefined}>
      <span className="olo-buscador__medida" aria-hidden="true" />
      <form role="search" className="olo-buscador__caja" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="buscador-sitio" className="sr-only">
          Buscar en el sitio web
        </label>
        <input
          ref={campoRef}
          id="buscador-sitio"
          name="q"
          type="search"
          role="combobox"
          aria-expanded={abierto && filteredResults.length > 0}
          aria-controls="buscador-sitio-resultados"
          aria-activedescendant={
            abierto && filteredResults[activo] ? `sitio-opcion-${activo}` : undefined
          }
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Buscar"
          className="olo-buscador__campo"
          // Cerrado no se ve, así que tampoco debe recibir el foco con Tab.
          tabIndex={abierto ? 0 : -1}
          aria-hidden={!abierto || undefined}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setActivo(0);
          }}
          onKeyDown={alPulsarTecla}
        />
        <button
          ref={lupaRef}
          type="button"
          className="olo-search-btn olo-buscador__lupa"
          aria-label={abierto ? 'Buscar' : 'Abrir el buscador del sitio web'}
          aria-expanded={abierto}
          aria-controls="buscador-sitio"
          id="header-search-btn"
          onClick={alPulsarLupa}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </form>

      <p aria-live="polite" className="sr-only">
        {!abierto || !hayConsulta
          ? ''
          : filteredResults.length === 0
            ? 'Sin resultados'
            : `${filteredResults.length} ${filteredResults.length === 1 ? 'resultado' : 'resultados'}`}
      </p>

      <div className="olo-buscador__resultados" data-visible={(abierto && hayConsulta) || undefined}>
        {filteredResults.length === 0 ? (
          <p className="olo-buscador__vacio">
            No hay nada en el sitio web que coincida con «{searchQuery.trim()}».
          </p>
        ) : (
          <ul ref={listaRef} id="buscador-sitio-resultados" role="listbox" aria-label="Resultados">
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
                  className="olo-buscador__opcion"
                >
                  <a
                    href={result.href}
                    tabIndex={-1}
                    onClick={(e) => {
                      e.preventDefault();
                      elegir(result);
                    }}
                  >
                    <span className="olo-buscador__contexto">
                      <span>{resaltarCoincidenciaTexto(result.context, searchQuery, RESALTADO)}</span>
                      <span className="olo-buscador__tipo">
                        {result.type === 'h1'
                          ? 'Página'
                          : result.type === 'h2'
                            ? 'Sección'
                            : 'Contenido'}
                      </span>
                    </span>
                    <span
                      className={
                        result.type === 'h1' || result.type === 'h2'
                          ? 'olo-buscador__texto'
                          : 'olo-buscador__texto olo-buscador__texto--contenido'
                      }
                    >
                      {resaltarCoincidenciaTexto(result.text, searchQuery, RESALTADO)}
                    </span>
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

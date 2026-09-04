'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { buscarEnPanel, type DestinoPanel } from '../lib/indice-panel';

/**
 * Buscador del panel: una capa que tapa la pantalla entera con el campo al centro.
 *
 * Ocupa el 100 % del alto y del ancho —blanco en modo claro, azul oscuro
 * (`#0b1121`, el mismo `--background` que ya usa el panel) en oscuro— en vez de ser
 * una caja flotante: al buscar no hay nada del panel que mirar de fondo, y una capa
 * opaca evita el bizqueo entre lo de detrás y lo de delante.
 *
 * Sigue el patrón `combobox` de ARIA en vez de dejar los resultados en el orden de
 * tabulación: el foco no se mueve nunca del campo —se sigue escribiendo mientras se
 * recorre la lista con las flechas— y quien usa lector de pantalla oye el resultado
 * activo por `aria-activedescendant`. Aun así cada resultado es un enlace de verdad
 * (con `tabIndex={-1}`), para que el clic central y «copiar dirección» funcionen.
 */
export function BuscadorModal({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);

  const [consulta, setConsulta] = useState('');
  const [activo, setActivo] = useState(0);

  const resultados = useMemo(() => buscarEnPanel(consulta), [consulta]);

  /**
   * Cierra volviendo a lo anterior.
   *
   * Si se llegó aquí escribiendo la URL a mano no hay «anterior» dentro del panel y
   * `back()` sacaría del sitio; en ese caso se vuelve al dashboard.
   */
  const cerrar = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      if (window.history.length > 1) router.back();
      else router.push('/admin/dashboard');
    }
  }, [router, onClose]);

  // El campo recibe el foco al abrir. Se hace con `ref` y no con el atributo
  // `autoFocus`, que la configuración de accesibilidad del proyecto prohíbe (§154 de
  // `9-accesibilidad.md`): aquí es correcto porque el foco *debe* entrar al diálogo.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Mientras la capa está encima, lo de debajo no se desplaza: sin esto, la rueda
  // del ratón sobre el fondo mueve el panel que hay detrás de la capa.
  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo;
    };
  }, []);

  // Acompaña con el desplazamiento al resultado activo cuando se recorre con el
  // teclado y la lista es más larga que su caja.
  useEffect(() => {
    listaRef.current
      ?.querySelector('[data-activo="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [activo]);

  const irA = useCallback(
    (destino: DestinoPanel | undefined) => {
      if (destino) {
        if (onClose) onClose();
        if (destino.href.startsWith('http://') || destino.href.startsWith('https://')) {
          window.location.href = destino.href;
        } else {
          router.push(destino.href);
        }
      }
    },
    [router, onClose]
  );

  const alPulsarTecla = (evento: React.KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      cerrar();
      return;
    }
    if (resultados.length === 0) return;

    if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      setActivo((i) => (i + 1) % resultados.length);
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      setActivo((i) => (i - 1 + resultados.length) % resultados.length);
    } else if (evento.key === 'Enter') {
      evento.preventDefault();
      irA(resultados[activo]);
    }
  };

  const idActivo = resultados[activo] ? `buscador-opcion-${resultados[activo].id}` : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscar en el panel"
      className="fixed inset-0 z-50 h-[100dvh] w-screen overflow-y-auto bg-white dark:bg-[#0b1121]"
    >
      {/* Se aparta del borde derecho para no caer debajo del conmutador de tema, que
          está fijo en `top-4 right-4` con un z-index mayor. */}
      <button
        type="button"
        onClick={cerrar}
        aria-label="Cerrar el buscador"
        className="absolute top-4 right-20 rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-focus)] dark:text-[#94a3b8] dark:hover:bg-[#131b2f] dark:hover:text-white"
      >
        <XMarkIcon className="size-6" />
      </button>

      <div className="mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col justify-center px-4 py-20">
        <label htmlFor="buscador-panel" className="sr-only">
          Buscar en el panel
        </label>

        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-5 size-6 -translate-y-1/2 text-zinc-400 dark:text-[#94a3b8]" />
          <input
            ref={inputRef}
            id="buscador-panel"
            type="search"
            role="combobox"
            aria-expanded={resultados.length > 0}
            aria-controls="buscador-resultados"
            aria-activedescendant={idActivo}
            aria-autocomplete="list"
            autoComplete="off"
            placeholder="Buscar en el panel…"
            value={consulta}
            // La selección vuelve arriba con cada cambio de consulta: conservar el
            // índice anterior dejaría marcado un resultado que ya no está en la lista.
            onChange={(e) => {
              setConsulta(e.target.value);
              setActivo(0);
            }}
            onKeyDown={alPulsarTecla}
            className="h-16 w-full rounded-[16px] border border-zinc-200 bg-white pr-5 pl-14 text-lg text-zinc-950 shadow-sm transition-colors outline-none placeholder:text-zinc-400 focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-focus)] dark:border-[#1e293b] dark:bg-[#131b2f] dark:text-[#f6f6f6] dark:placeholder:text-[#94a3b8]"
          />
        </div>

        {/* El recuento se anuncia solo al cambiar; sin esto, quien no ve la lista no
            sabe si lo que escribe encuentra algo. */}
        <p aria-live="polite" className="sr-only">
          {resultados.length === 0
            ? 'Sin resultados'
            : `${resultados.length} ${resultados.length === 1 ? 'resultado' : 'resultados'}`}
        </p>

        {resultados.length === 0 ? (
          <p className="mt-8 text-center text-sm text-zinc-500 dark:text-[#94a3b8]">
            No hay nada en el panel que coincida con «{consulta.trim()}».
          </p>
        ) : (
          <ul
            ref={listaRef}
            id="buscador-resultados"
            role="listbox"
            aria-label="Resultados"
            className="mt-6 max-h-[45vh] space-y-1 overflow-y-auto"
          >
            {resultados.map((destino, indice) => {
              const seleccionado = indice === activo;
              return (
                <li
                  key={destino.id}
                  id={`buscador-opcion-${destino.id}`}
                  role="option"
                  aria-selected={seleccionado}
                  data-activo={seleccionado}
                  onMouseEnter={() => setActivo(indice)}
                  className={`rounded-[16px] ${
                    seleccionado ? 'bg-zinc-100 dark:bg-[#131b2f]' : ''
                  }`}
                >
                  <Link
                    href={destino.href}
                    tabIndex={-1}
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                    className="block px-4 py-3 no-underline"
                  >
                    <span className="block text-base font-medium text-zinc-950 dark:text-[#f6f6f6]">
                      {destino.titulo}
                    </span>
                    <span className="block text-sm text-zinc-500 dark:text-[#94a3b8]">
                      {destino.descripcion}
                    </span>
                    <span className="mt-1 block text-xs text-zinc-400 dark:text-[#7c8db0]">
                      {destino.grupo}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

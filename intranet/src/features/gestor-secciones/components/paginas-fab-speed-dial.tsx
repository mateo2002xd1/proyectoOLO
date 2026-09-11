'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { enlaceAlEditor } from '../lib/ruta-de-vuelta';
import { SLUG_PLANTILLA } from '../lib/plantilla';
import { ModalNuevaSeccion } from './modal-nueva-seccion';
import { ModalEliminarSeccion } from './modal-eliminar-seccion';
import { apiClient } from '@/shared/lib/api-client';

function slugDeRuta(ruta: string): string {
  const limpio = (ruta || '').split('?')[0].split('#')[0];
  const segmentos = limpio.split('/').filter(Boolean);
  if (segmentos.length === 0) return 'inicio';
  return segmentos.join('-');
}

export interface PaginasFabSpeedDialProps {
  esSuperadmin?: boolean;
  permisosActivos?: string[];
}

export function PaginasFabSpeedDial({
  esSuperadmin = false,
  permisosActivos: permisosIniciales = [],
}: PaginasFabSpeedDialProps) {
  const rutaActual = usePathname() ?? '/inicio';
  const slug = slugDeRuta(rutaActual);

  const [montado, setMontado] = useState(false);
  const [permisosActivos, setPermisosActivos] = useState<string[]>(permisosIniciales);

  useEffect(() => {
    setMontado(true);
    let vigente = true;
    apiClient.get<{ permisos?: string[] }>('/me')
      .then((datos) => {
        if (vigente && Array.isArray(datos.permisos)) {
          setPermisosActivos(datos.permisos.map(String));
        }
      })
      .catch(() => {
        if (vigente) setPermisosActivos([]);
      });
    return () => {
      vigente = false;
    };
  }, []);

  const tienePermisoEditarSeccion = permisosActivos.includes(`editar.intranet.${slug}`);
  const tienePermisoEditarPlantilla = permisosActivos.includes('editar.intranet.menu-y-pie');

  const puedeEditarSeccion = Boolean(slug) && tienePermisoEditarSeccion;
  const puedeEditarPlantilla = tienePermisoEditarPlantilla;
  const puedeCrearSeccion = permisosActivos.includes('secciones.crear');
  const puedeEliminarSeccion = Boolean(slug) && permisosActivos.includes('secciones.eliminar');

  const tieneAlgunaAccion =
    puedeEditarSeccion || puedeEditarPlantilla || puedeCrearSeccion || puedeEliminarSeccion;

  const [abierto, setAbierto] = useState(false);
  const [modalNuevaAbierto, setModalNuevaAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);

  const contenedorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const alternarMenu = () => {
    setAbierto((prev) => !prev);
  };

  const cerrarMenu = useCallback(() => {
    setAbierto(false);
  }, []);

  // Cierre al hacer clic fuera
  useEffect(() => {
    if (!abierto) return;

    const manejarClicFuera = (evento: MouseEvent | TouchEvent) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(evento.target as Node)
      ) {
        cerrarMenu();
      }
    };

    document.addEventListener('pointerdown', manejarClicFuera);
    return () => {
      document.removeEventListener('pointerdown', manejarClicFuera);
    };
  }, [abierto, cerrarMenu]);

  // Cierre con la tecla Escape
  useEffect(() => {
    if (!abierto) return;

    const manejarTeclaEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        cerrarMenu();
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('keydown', manejarTeclaEscape);
    return () => {
      window.removeEventListener('keydown', manejarTeclaEscape);
    };
  }, [abierto, cerrarMenu]);

  // Durante SSR y primera hidratación en cliente no se pinta para evitar mismatch de hidratación.
  if (!montado) return null;

  // Si no tiene permisos para ninguna acción, no se pinta nada
  if (!tieneAlgunaAccion) return null;

  return (
    <>
      <div
        ref={contenedorRef}
        className={`fab-speed-dial ${abierto ? 'fab-speed-dial--abierto' : ''}`}
        aria-label="Acciones de administración de página"
      >
        {/* Submenú de acciones desplegables hacia arriba */}
        <div
          className={`fab-speed-dial__acciones ${
            abierto ? 'fab-speed-dial__acciones--visible' : ''
          }`}
          role="menu"
          aria-hidden={!abierto}
        >
          {/* 1. Editar sección */}
          {puedeEditarSeccion && (
            <div className="fab-speed-dial__item" role="none">
              <span className="fab-speed-dial__tooltip" role="tooltip">
                Editar sección
              </span>
              <Link
                href={enlaceAlEditor(slug, rutaActual || `/${slug}`)}
                role="menuitem"
                onClick={cerrarMenu}
                className="fab-speed-dial__btn fab-speed-dial__btn--editar"
                aria-label="Editar sección"
                title="Editar sección"
                tabIndex={abierto ? 0 : -1}
              >
                <svg
                  viewBox="0 0 24 24"
                  width={18}
                  height={18}
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </Link>
            </div>
          )}

          {/* 2. Menú y pie */}
          {puedeEditarPlantilla && (
            <div className="fab-speed-dial__item" role="none">
              <span className="fab-speed-dial__tooltip" role="tooltip">
                Editar menú y pie
              </span>
              <Link
                href={enlaceAlEditor(SLUG_PLANTILLA, rutaActual || '/inicio')}
                role="menuitem"
                onClick={cerrarMenu}
                className="fab-speed-dial__btn fab-speed-dial__btn--plantilla"
                aria-label="Editar menú y pie"
                title="Editar menú y pie"
                tabIndex={abierto ? 0 : -1}
              >
                <svg
                  viewBox="0 0 24 24"
                  width={18}
                  height={18}
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2 2 7l10 5 10-5-10-5Z" />
                  <path d="m2 17 10 5 10-5" />
                  <path d="m2 12 10 5 10-5" />
                </svg>
              </Link>
            </div>
          )}

          {/* 3. Nueva página */}
          {puedeCrearSeccion && (
            <div className="fab-speed-dial__item" role="none">
              <span className="fab-speed-dial__tooltip" role="tooltip">
                Nueva sección
              </span>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  cerrarMenu();
                  setModalNuevaAbierto(true);
                }}
                className="fab-speed-dial__btn fab-speed-dial__btn--nueva"
                aria-label="Nueva sección"
                title="Nueva sección"
                tabIndex={abierto ? 0 : -1}
              >
                <svg
                  viewBox="0 0 24 24"
                  width={18}
                  height={18}
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </button>
            </div>
          )}

          {/* 4. Eliminar página */}
          {puedeEliminarSeccion && (
            <div className="fab-speed-dial__item" role="none">
              <span className="fab-speed-dial__tooltip" role="tooltip">
                Eliminar sección
              </span>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  cerrarMenu();
                  setModalEliminarAbierto(true);
                }}
                className="fab-speed-dial__btn fab-speed-dial__btn--eliminar"
                aria-label="Eliminar sección"
                title="Eliminar sección"
                tabIndex={abierto ? 0 : -1}
              >
                <svg
                  viewBox="0 0 24 24"
                  width={18}
                  height={18}
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Botón Principal (Trigger FAB fijo abajo) */}
        <button
          ref={triggerRef}
          type="button"
          onClick={alternarMenu}
          className={`fab-speed-dial__trigger ${
            abierto ? 'fab-speed-dial__trigger--activo' : ''
          }`}
          aria-haspopup="menu"
          aria-expanded={abierto}
          aria-label={abierto ? 'Cerrar menú de acciones' : 'Abrir menú de acciones'}
          title={abierto ? 'Cerrar menú de acciones' : 'Acciones de página'}
        >
          <span className="fab-speed-dial__icono-wrapper">
            {abierto ? (
              <svg
                className="fab-speed-dial__icono"
                viewBox="0 0 24 24"
                width={22}
                height={22}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                className="fab-speed-dial__icono"
                viewBox="0 0 24 24"
                width={20}
                height={20}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            )}
          </span>
        </button>
      </div>

      {/* Diálogos modales controlados por el FAB */}
      <ModalNuevaSeccion
        abierto={modalNuevaAbierto}
        alCerrar={() => setModalNuevaAbierto(false)}
      />

      <ModalEliminarSeccion
        slug={slug}
        abierto={modalEliminarAbierto}
        alCerrar={() => setModalEliminarAbierto(false)}
      />
    </>
  );
}

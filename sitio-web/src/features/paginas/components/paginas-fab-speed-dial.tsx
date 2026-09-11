'use client';

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { enlaceAlEditor } from '../lib/ruta-de-vuelta';
import { SLUG_PLANTILLA } from '../lib/plantilla';
import { usePermisoDeSeccion } from '../hooks/use-permiso-de-seccion';
import { permisosDeLaSesion } from '../services/paginas.service';
import { AUTH_ROLE_COOKIE_NAME } from '@/shared/lib/auth-cookies';
import { ModalNuevaSeccion } from './modal-nueva-seccion';
import { ModalEliminarSeccion } from './modal-eliminar-seccion';

const ROLES_QUE_EDITAN = ['superadmin', 'administrador', 'editor', 'admin'];

function leerCookie(nombre: string): string | null {
  if (typeof document === 'undefined') return null;
  const coincidencia = document.cookie.match(new RegExp('(?:^|; )' + nombre + '=([^;]*)'));
  if (!coincidencia || !coincidencia[1]) return null;
  return decodeURIComponent(coincidencia[1]).replace(/^["']|["']$/g, '').trim().toLowerCase();
}

function leerRolActual(): string {
  return (
    leerCookie(AUTH_ROLE_COOKIE_NAME) ||
    leerCookie('role') ||
    leerCookie('rol') ||
    leerCookie('sitio_role') ||
    ''
  );
}

function esSuperadminSincrono(): boolean {
  const rol = leerRolActual();
  return rol === 'superadmin';
}

function sinSuscripcion() {
  return () => {};
}

function slugDeRuta(ruta: string): string {
  const limpio = (ruta || '').split('?')[0].split('#')[0];
  const segmentos = limpio.split('/').filter(Boolean);
  if (segmentos.length === 0) return 'inicio';
  return segmentos.join('-');
}

export function PaginasFabSpeedDial() {
  const rutaActual = usePathname() ?? '/';
  const slug = slugDeRuta(rutaActual);

  // Lectura síncrona en cliente con useSyncExternalStore (evita parpadeos y retrasos)
  const esSuperadminPorCookie = useSyncExternalStore(
    sinSuscripcion,
    esSuperadminSincrono,
    () => false
  );

  const [rolDeApiValido, setRolDeApiValido] = useState(false);
  const [permisosActivos, setPermisosActivos] = useState<string[]>([]);
  const puedeCrear = usePermisoDeSeccion('secciones.crear');
  const puedeEliminar = usePermisoDeSeccion('secciones.eliminar');

  useEffect(() => {
    let vigente = true;

    // Verificación de respaldo con /api/me para asegurar que sesiones activas siempre reciban el FAB
    permisosDeLaSesion().then((permisos) => {
      if (vigente) {
        setPermisosActivos(permisos || []);
        if ((permisos || []).length > 0 || esSuperadminSincrono()) {
          setRolDeApiValido(true);
        }
      }
    });

    return () => {
      vigente = false;
    };
  }, []);

  const esSuperadmin = esSuperadminPorCookie; 

  const tienePermisoEditarSeccion = permisosActivos.includes(`editar.sitio.${slug}`);
  const tienePermisoEditarPlantilla = permisosActivos.includes('editar.sitio.menu-y-pie');

  const puedeEditarSeccion = Boolean(slug) && (esSuperadmin || tienePermisoEditarSeccion);
  const puedeEditarPlantilla = esSuperadmin || tienePermisoEditarPlantilla;
  const puedeCrearSeccion = puedeCrear || esSuperadmin;
  const puedeEliminarSeccion = Boolean(slug) && (puedeEliminar || esSuperadmin);

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

  // Si el usuario no tiene permisos para ninguna acción, no se pinta nada
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
          {/* 1. Editar sección (más cercano al disparador en column-reverse) */}
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
                  viewBox="0 0 25 23"
                  width={18}
                  height={18}
                  aria-hidden="true"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.474 3.607L21.389 7.522a.5.5 0 0 1 0 .707L11.91 17.6l-4.028.447a.5.5 0 0 1-.552-.552l.447-4.028L16.875 3.607a.5.5 0 0 1 .6 0ZM24.505 2.613L22.387.494a2.083 2.083 0 0 0-2.396 0L18.455 2.03a.5.5 0 0 0 0 .708l3.915 3.915a.5.5 0 0 0 .707 0l1.429-1.429a2.083 2.083 0 0 0 0-2.61ZM16.667 15.022V19.44H2.778V5.551h9.974a.5.5 0 0 0 .355-.148l1.736-1.736c.33-.33.096-.89-.442-.89H2.083A2.083 2.083 0 0 0 0 4.857v15.277c0 1.15.933 2.083 2.083 2.083h15.278c1.15 0 2.083-.933 2.083-2.083v-6.849c0-.464-.56-.694-.889-.364l-1.736 1.736a.5.5 0 0 0-.152.365Z"
                    fill="currentColor"
                  />
                </svg>
              </Link>
            </div>
          )}

          {/* 2. Menú y pie */}
          {puedeEditarPlantilla && (
            <div className="fab-speed-dial__item" role="none">
              <span className="fab-speed-dial__tooltip" role="tooltip">
                Menú y pie
              </span>
              <Link
                href={enlaceAlEditor(SLUG_PLANTILLA, rutaActual || '/')}
                role="menuitem"
                onClick={cerrarMenu}
                className="fab-speed-dial__btn fab-speed-dial__btn--plantilla"
                aria-label="Menú y pie"
                title="Menú y pie"
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
                Nueva página
              </span>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  cerrarMenu();
                  setModalNuevaAbierto(true);
                }}
                className="fab-speed-dial__btn fab-speed-dial__btn--nueva"
                aria-label="Nueva página"
                title="Nueva página"
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

          {/* 4. Eliminar página (extremo superior del menú desplegado) */}
          {puedeEliminarSeccion && (
            <div className="fab-speed-dial__item" role="none">
              <span className="fab-speed-dial__tooltip" role="tooltip">
                Eliminar página
              </span>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  cerrarMenu();
                  setModalEliminarAbierto(true);
                }}
                className="fab-speed-dial__btn fab-speed-dial__btn--eliminar"
                aria-label="Eliminar página"
                title="Eliminar página"
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
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

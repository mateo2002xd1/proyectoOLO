'use client';

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { enlaceAlEditor, slugDeRutaPublica } from '../../model/rutas';
import { SLUG_PLANTILLA } from '../../navegation/menu-y-pie';
import { usePermisoDeSeccion } from '../hooks/use-permiso-de-seccion';
import { permisosDeLaSesion } from '../services/secciones.service';
import { cerrarSesionLocal } from '@/shared/lib/api/api-client';
import { AUTH_ROLE_COOKIE_NAME } from '@/shared/lib/session/auth-cookies';
import { ModalNuevaSeccion } from './modal-nueva-seccion';
import { ModalEliminarSeccion } from './modal-eliminar-seccion';
import { ModalCerrarSesion } from './modal-cerrar-sesion';
import { Pencil, X } from 'lucide-react';

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

const sinSuscripcion = () => () => { };
const enCliente = () => true;
const enServidor = () => false;

export function PaginasFabSpeedDial() {
  const rutaActual = usePathname() ?? '/';
  const slug = slugDeRutaPublica(rutaActual);

  // Lectura síncrona en cliente con useSyncExternalStore (evita parpadeos y retrasos)
  const esSuperadminPorCookie = useSyncExternalStore(
    sinSuscripcion,
    esSuperadminSincrono,
    () => false
  );
  const montado = useSyncExternalStore(sinSuscripcion, enCliente, enServidor);
  const [permisosActivos, setPermisosActivos] = useState<string[]>([]);
  const puedeCrear = usePermisoDeSeccion('secciones.crear');
  const puedeEliminar = usePermisoDeSeccion('secciones.eliminar');

  useEffect(() => {
    let vigente = true;

    const actualizarPermisos = () => {
      permisosDeLaSesion().then((permisos) => {
        if (vigente) {
          setPermisosActivos(permisos || []);
        }
      });
    };

    actualizarPermisos();

    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'visible') {
        actualizarPermisos();
      }
    };

    window.addEventListener('focus', actualizarPermisos);
    document.addEventListener('visibilitychange', alCambiarVisibilidad);

    return () => {
      vigente = false;
      window.removeEventListener('focus', actualizarPermisos);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    };
  }, [slug]);

  const esSuperadmin = esSuperadminPorCookie;

  const tieneAccesoSitio = permisosActivos.includes('acceso.sitio');
  const tienePermisoGlobal = esSuperadmin || tieneAccesoSitio;

  const tienePermisoEditarSeccion = permisosActivos.includes(`editar.sitio.${slug}`);
  const tienePermisoEditarPlantilla = permisosActivos.includes('editar.sitio.menu-y-pie');

  const puedeEditarSeccion = tienePermisoGlobal && Boolean(slug) && (esSuperadmin || tienePermisoEditarSeccion);
  const puedeEditarPlantilla = tienePermisoGlobal && (esSuperadmin || tienePermisoEditarPlantilla);
  const puedeCrearSeccion = tienePermisoGlobal && (puedeCrear || esSuperadmin);
  const puedeEliminarSeccion = tienePermisoGlobal && Boolean(slug) && (puedeEliminar || esSuperadmin);

  const tieneAlgunaAccion =
    puedeEditarSeccion || puedeEditarPlantilla || puedeCrearSeccion || puedeEliminarSeccion;

  const [abierto, setAbierto] = useState(false);
  const [modalNuevaAbierto, setModalNuevaAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [modalSalirAbierto, setModalSalirAbierto] = useState(false);

  const contenedorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [saliendo, setSaliendo] = useState(false);

  // Cierra la sesión y recarga la misma página: sin cookie de sesión el FAB desaparece
  // y el portal queda como lo ve un visitante.
  const salirDelModoEdicion = async () => {
    if (saliendo) return;
    setSaliendo(true);
    await cerrarSesionLocal();
    window.location.reload();
  };

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
  // Una vez montado en cliente, si el usuario no tiene permisos para ninguna acción, tampoco se pinta nada.
  if (!montado || !tieneAlgunaAccion) return null;

  return (
    <>
      <div
        ref={contenedorRef}
        className={`fab-speed-dial fab-speed-dial--con-salir ${abierto ? 'fab-speed-dial--abierto' : ''}`}
        aria-label="Acciones de administración de página"
      >
        {/* Submenú de acciones desplegables hacia arriba */}
        <div
          className={`fab-speed-dial__acciones ${abierto ? 'fab-speed-dial__acciones--visible' : ''
            }`}
          role="menu"
          aria-hidden={!abierto}
        >
          {/* 1. Editar página (más cercano al disparador en column-reverse) */}
          {puedeEditarSeccion && (
            <div className="fab-speed-dial__item" role="none">
              <span className="fab-speed-dial__tooltip" role="tooltip">
                Editar página
              </span>
              <Link
                href={enlaceAlEditor(slug, rutaActual || `/${slug}`)}
                role="menuitem"
                onClick={cerrarMenu}
                className="fab-speed-dial__btn fab-speed-dial__btn--editar"
                aria-label="Editar página"
                title="Editar página"
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
            <div className="fab-speed-dial__item fab-speed-dial__item--eliminar" role="none">
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
        <div className="fab-speed-dial__item">
          <span className="fab-speed-dial__tooltip" role="tooltip">
            {abierto ? 'Cerrar opciones' : 'Opciones de edición'}
          </span>
          <button
            ref={triggerRef}
            type="button"
            onClick={alternarMenu}
            className={`fab-speed-dial__trigger ${abierto ? 'fab-speed-dial__trigger--activo' : ''
              }`}
            aria-haspopup="menu"
            aria-expanded={abierto}
            aria-label={abierto ? 'Cerrar menú de acciones' : 'Abrir menú de acciones'}
          >
            <span className="fab-speed-dial__icono-wrapper">
              {abierto ? (
                <X className="fab-speed-dial__icono" size={22} strokeWidth={2.2} aria-hidden="true" />
              ) : (
                <Pencil className="fab-speed-dial__icono" size={20} strokeWidth={2.2} aria-hidden="true" />
              )}
            </span>
          </button>
        </div>

        {/* Salir del modo edición: siempre a la vista, debajo del lápiz */}
        <div className="fab-speed-dial__item fab-speed-dial__item--salir">
          <span className="fab-speed-dial__tooltip" role="tooltip">
            Salir del modo edición
          </span>
          <button
            type="button"
            onClick={() => {
              cerrarMenu();
              setModalSalirAbierto(true);
            }}
            disabled={saliendo}
            className="fab-speed-dial__btn fab-speed-dial__btn--salir"
            aria-label="Salir del modo edición"
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
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

      <ModalCerrarSesion
        abierto={modalSalirAbierto}
        saliendo={saliendo}
        alConfirmar={salirDelModoEdicion}
        alCerrar={() => setModalSalirAbierto(false)}
      />
    </>
  );
}

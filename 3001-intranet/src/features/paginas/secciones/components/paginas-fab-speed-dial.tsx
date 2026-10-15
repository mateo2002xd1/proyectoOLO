'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { enlaceAlEditor, slugDeRutaPublica } from '../../model/rutas';
import { SLUG_PLANTILLA } from '../../menu-y-pie/menu-y-pie';
import { ModalNuevaSeccion } from './modal-nueva-seccion';
import { ModalEliminarSeccion } from './modal-eliminar-seccion';
import { ModalCerrarSesion } from './modal-cerrar-sesion';
import { pedirPermisosDeLaSesion } from '../services/secciones.service';

export interface PaginasFabSpeedDialProps {
  esSuperadmin?: boolean;
  permisosActivos?: string[];
  /** Este botón es el «Cerrar sesión» de quien edita: la barra de arriba no lo lleva
   *  para ellos (`MarcoSecciones`). Con esto se pinta aunque en la sección actual no
   *  haya nada que editar, solo con el botón rojo. */
  conCerrarSesion?: boolean;
}

export function PaginasFabSpeedDial({
  esSuperadmin = false,
  permisosActivos: permisosIniciales = [],
  conCerrarSesion = false,
}: PaginasFabSpeedDialProps) {
  const rutaActual = usePathname() ?? '/inicio';
  const slug = slugDeRutaPublica(rutaActual);

  const [montado, setMontado] = useState(false);
  const [permisosActivos, setPermisosActivos] = useState<string[]>(permisosIniciales);

  // `montado` marca que ya estamos en el navegador —el FAB no debe pintarse en el HTML
  // del servidor— y a continuación se piden los permisos reales de la sesión. Los dos
  // son información que no existe durante el render: la primera solo la sabe el efecto,
  // la segunda llega por red. Ver §9 de 2-convenciones-del-proyecto.md.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMontado(true);
    let vigente = true;

    const actualizarPermisos = () => {
      pedirPermisosDeLaSesion()
        .then((permisos) => {
          if (vigente) setPermisosActivos(permisos);
        })
        .catch(() => {
          if (vigente) setPermisosActivos([]);
        });
    };

    // Carga inicial
    actualizarPermisos();

    // Revalidar cuando la pestaña recupera el foco o se hace visible
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

  const tieneAccesoIntranet = permisosActivos.includes('acceso.intranet');
  const tienePermisoGlobal = esSuperadmin || tieneAccesoIntranet;

  const tienePermisoEditarSeccion = permisosActivos.includes(`editar.intranet.${slug}`);
  const tienePermisoEditarPlantilla = permisosActivos.includes('editar.intranet.menu-y-pie');

  const puedeEditarSeccion = tienePermisoGlobal && Boolean(slug) && (esSuperadmin || tienePermisoEditarSeccion);
  const puedeEditarPlantilla = tienePermisoGlobal && (esSuperadmin || tienePermisoEditarPlantilla);
  const puedeCrearSeccion = tienePermisoGlobal && (esSuperadmin || permisosActivos.includes('secciones.crear'));
  const puedeEliminarSeccion = tienePermisoGlobal && Boolean(slug) && (esSuperadmin || permisosActivos.includes('secciones.eliminar'));

  const tieneAlgunaAccion =
    puedeEditarSeccion || puedeEditarPlantilla || puedeCrearSeccion || puedeEliminarSeccion;

  const [abierto, setAbierto] = useState(false);
  const [modalNuevaAbierto, setModalNuevaAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [modalSalirAbierto, setModalSalirAbierto] = useState(false);

  const contenedorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [saliendo, setSaliendo] = useState(false);

  // Cierra la sesión y lleva al login, igual que el resto de salidas de la intranet.
  const salirDelModoEdicion = async () => {
    if (saliendo) return;
    setSaliendo(true);
    try {
      await fetch('/api-backend/logout', { method: 'POST' });
    } catch {
      // Sin red igualmente se sale hacia el login.
    }
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- recarga completa a propósito: tras cerrar sesión no debe quedar nada de ella en la caché del cliente
    window.location.href = '/login?logout=1';
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
  if (!montado) return null;

  // Sin acciones en esta sección no se pinta nada, salvo que este sea su único
  // «Cerrar sesión»: entonces queda el botón rojo solo, sin el lápiz.
  if (!tieneAlgunaAccion && !conCerrarSesion) return null;

  return (
    <>
      <div
        ref={contenedorRef}
        className={`fab-speed-dial fab-speed-dial--con-salir ${abierto ? 'fab-speed-dial--abierto' : ''}`}
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
          {/* 1. Editar página */}
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
                href={enlaceAlEditor(SLUG_PLANTILLA, rutaActual || '/inicio')}
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

          {/* 4. Eliminar página */}
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

        {/* Botón Principal (Trigger FAB fijo abajo). Sin acciones no hay menú que abrir. */}
        {tieneAlgunaAccion && (
          <div className="fab-speed-dial__item">
            <span className="fab-speed-dial__tooltip" role="tooltip">
              {abierto ? 'Cerrar opciones' : 'Opciones de edición'}
            </span>
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
        )}

        {/* Cerrar sesión: siempre a la vista, debajo del lápiz */}
        <div className="fab-speed-dial__item fab-speed-dial__item--salir">
          <span className="fab-speed-dial__tooltip" role="tooltip">
            Cerrar sesión
          </span>
          <button
            type="button"
            onClick={() => {
              cerrarMenu();
              setModalSalirAbierto(true);
            }}
            disabled={saliendo}
            className="fab-speed-dial__btn fab-speed-dial__btn--salir"
            aria-label="Cerrar sesión"
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

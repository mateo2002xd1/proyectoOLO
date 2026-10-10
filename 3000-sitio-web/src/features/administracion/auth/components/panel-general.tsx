'use client';

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/shared/ui/molecules/dropdown';
import { Navbar, NavbarSection, NavbarSpacer } from '@/shared/ui/organisms/navbar';
import { NavegacionMobilePanel } from '@/shared/lib/mobile';
import {
  IDENTIDAD_DE_FABRICA,
  iconoDelPanel,
  iconoEnBlancoEnOscuro,
  logoDelPanel,
  logoEnBlancoEnOscuro,
  type IdentidadPanel,
} from '@/shared/lib/identidad-panel';
import { BuscadorModal } from '@/features/administracion/buscador';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/shared/ui/organisms/sidebar';
import { SidebarLayout } from '@/shared/ui/organisms/sidebar-layout';
import { EncabezadoPanel } from '@/shared/ui/molecules/encabezado-panel';
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/16/solid';
import {
  ArchiveBoxIcon,
  BellIcon,
  ClipboardDocumentCheckIcon,
  ArrowUpTrayIcon,
  HomeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid';
import { ThemeToggle } from '@/shared/ui/molecules/theme-toggle';
import { Paginador } from '@/shared/ui/molecules/paginador';
import { RouteTransition } from '@/shared/ui/atoms/route-transition';
import {
  listarEnRevision,
  resumenDePaginasPublicadas,
  SLUG_PLANTILLA,
  type PaginaEnRevision,
  type ResumenPaginasPublicadas,
} from '@/features/paginas';
import { TarjetaPaginasPublicadas } from './tarjeta-paginas-publicadas';
import { TarjetaVisitas } from './tarjeta-visitas';
import { TarjetaUsuarios } from './tarjeta-usuarios';
import {
  listarAuditoria,
  ErrorAuditoria,
  FraseDeRegistro,
  type RegistroAuditoria,
} from '@/features/administracion/auditoria';
import { useUsuarios } from '../hooks/use-usuarios';
import { listarAlertasCaducidad, type AlertaCaducidad } from '../services/alertas-caducidad.service';
import { CargandoSeccion } from '@/shared/ui/molecules/cargando-seccion';

/**
 * Grupo colapsable del sidebar con animación de acordeón.
 * Se abre automáticamente si la ruta activa empieza con alguno de los `prefixes`.
 * Pasa el `pathname` actual a los hijos vía render prop para que calculen `current`
 * sin violar las reglas de hooks.
 */
function SidebarGroup({
  label,
  icon: Icon,
  prefixes,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prefixes: string[];
  children: (pathname: string) => React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = prefixes.some((p) => pathname.startsWith(p));
  const [open, setOpen] = useState(isActive);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-base font-semibold transition [&>svg]:size-5 [&>svg]:shrink-0 ${isActive
          ? 'bg-zinc-100 text-[#7DB728] dark:bg-brand-interactive/20 dark:text-brand-interactive [&>svg]:text-[#7DB728] dark:[&>svg]:text-brand-interactive'
          : 'text-zinc-600 hover:bg-[#001631]/10 hover:text-[#7DB728] dark:text-slate-400 dark:hover:bg-brand-interactive/10 dark:hover:text-brand-interactive [&>svg]:text-zinc-500 dark:[&>svg]:text-slate-400 hover:[&>svg]:text-[#7DB728] dark:hover:[&>svg]:text-brand-interactive'
          }`}
        aria-expanded={open}
      >
        <Icon className="shrink-0" />
        <span className="flex-1 truncate text-left">{label}</span>
        <ChevronDownIcon
          className={`size-4 shrink-0 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''
            }`}
        />
      </button>

      {/* Acordeón: grid-template-rows 0fr → 1fr */}
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-0.5 pb-1 pt-0.5">{children(pathname)}</div>
        </div>
      </div>
    </div>
  );
}


/** Cuántos registros se traen del servidor para paginar en la tarjeta; el resto
 *  (más allá de esta ventana) se lee en Auditoría. Se alinea con la opción más
 *  grande del selector de filas por página para que "100" no muestre menos. */
const CAMBIOS_RECIENTES = 100;

/**
 * La plantilla (`menu-y-pie`, cabecera y pie comunes) sale del recuento de «Páginas
 * publicadas»: no es una página de contenido, así que ni cuenta ni aparece en el
 * listado por aplicación. El total se recalcula sobre lo que queda, no se resta 1 a
 * mano, para no desincronizarse si algún día son más las páginas de plantilla.
 */
function sinPlantilla(resumen: ResumenPaginasPublicadas): ResumenPaginasPublicadas {
  const sitio = resumen.sitio.filter((p) => p.slug !== SLUG_PLANTILLA);
  const intranet = resumen.intranet.filter((p) => p.slug !== SLUG_PLANTILLA);
  return { sitio, intranet, total: sitio.length + intranet.length };
}

/** Botón de la barra superior del móvil (buscar y tema). */
const BOTON_BARRA_MOVIL =
  'flex size-11 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-[#94a3b8] dark:hover:bg-zinc-800 dark:hover:text-white [&>svg]:size-5 [&>svg]:shrink-0';

/** Contador rojo tipo campanita, para marcar cambios pendientes junto a un item del sidebar. */
function ContadorSidebar({ cantidad }: { cantidad: number }) {
  if (cantidad <= 0) return null;
  return (
    <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
      {cantidad}
    </span>
  );
}

function ModalAlertas({
  abierto,
  onCerrar,
  cuentasPorVencer,
  enRevision,
  onDismissCuenta,
  onDismissRevision,
}: {
  abierto: boolean;
  onCerrar: () => void;
  cuentasPorVencer: AlertaCaducidad[];
  enRevision: PaginaEnRevision[];
  onDismissCuenta: (email: string) => void;
  onDismissRevision: (id: string) => void;
}) {
  if (!abierto || typeof document === 'undefined') return null;
  const total = cuentasPorVencer.length + enRevision.length;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0f172a]/50 p-3 backdrop-blur-sm sm:p-6"
      // Usamos `onMouseDown` y no `onClick`: si el usuario selecciona texto dentro
      // del panel y suelta el ratón fuera, el clic se contabiliza en el fondo y
      // el panel se cerraba en mitad de la selección.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        // Sin alto mínimo: la caja mide lo que su contenido, hasta el 88 % de la
        // pantalla; con más alertas, la lista hace scroll dentro.
        className="flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#121824]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="alertas-titulo"
      >
        <header className="border-b border-zinc-100 px-5 py-4 sm:px-8 sm:py-6 dark:border-zinc-800/80">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 id="alertas-titulo" className="text-xl font-semibold text-[#001631] dark:text-[#e6e8f0]">
                Notificaciones
              </h3>
              <p className="mt-1 text-base text-zinc-500 dark:text-[#94a3b8]">
                Tienes {total} alerta{total !== 1 ? 's' : ''} pendiente{total !== 1 ? 's' : ''}.
              </p>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3 sm:px-8 sm:py-5">
          {total === 0 ? (
            <p className="py-8 text-center text-base text-zinc-500 dark:text-[#94a3b8]">
              No hay alertas pendientes en este momento.
            </p>
          ) : (
            <div className="space-y-3">
              {cuentasPorVencer.map((a) => (
                // Sin fondo ni borde en la fila: el estado lo dicen la etiqueta y el
                // color del texto, que es el mismo de la etiqueta.
                <div key={a.userId || a.email} className="group flex h-11 w-full items-center gap-2">
                  <span className="shrink-0 rounded-full bg-amber-200/80 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-800/60 dark:text-amber-100">
                    Por vencer
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm text-amber-900 dark:text-amber-100">
                    <Link href="/admin/users" className="font-medium underline hover:no-underline">
                      {a.email}
                    </Link>
                    {' '}vence en {a.daysLeft} día{a.daysLeft !== 1 ? 's' : ''}
                  </p>
                  <button
                    type="button"
                    onClick={() => onDismissCuenta(a.email)}
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-amber-900 hover:bg-amber-200/70 dark:text-amber-100 dark:hover:bg-amber-900/50"
                    aria-label={`Marcar como solucionada: ${a.email}`}
                    title="Marcar como solucionada"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              ))}

              {enRevision.map((p) => (
                <div key={p.id} className="group flex h-11 w-full items-center gap-2">
                  <span className="shrink-0 rounded-full bg-blue-200/80 px-2.5 py-1 text-xs font-semibold text-blue-900 dark:bg-blue-800/60 dark:text-blue-100">
                    En revisión
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm text-blue-900 dark:text-blue-100">
                    <Link href="/admin/revision" className="font-medium underline hover:no-underline">
                      {p.titulo}
                    </Link>
                  </p>
                  <button
                    type="button"
                    onClick={() => onDismissRevision(p.id)}
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-blue-900 hover:bg-blue-200/70 dark:text-blue-100 dark:hover:bg-blue-900/50"
                    aria-label={`Marcar como solucionada: ${p.titulo}`}
                    title="Marcar como solucionada"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function PanelGeneralLayout({
  children,
  userProfile,
  identidad = IDENTIDAD_DE_FABRICA,
  className,
}: {
  children: React.ReactNode;
  userProfile?: { name: string; email: string };
  /** Logo e icono de Configuración → Identidad visual; la lee `app/admin/layout.tsx`. */
  identidad?: IdentidadPanel;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isBuscarOpen, setIsBuscarOpen] = useState(false);
  const [isAlertasOpen, setIsAlertasOpen] = useState(false);
  const [alertasVistas, setAlertasVistas] = useState(false);
  const [enRevision, setEnRevision] = useState<PaginaEnRevision[]>([]);
  const [cuentasPorVencer, setCuentasPorVencer] = useState<AlertaCaducidad[]>([]);

  const handleDismissCuenta = useCallback((email: string) => {
    setCuentasPorVencer((prev) => prev.filter((c) => c.email !== email));
  }, []);

  const handleDismissRevision = useCallback((id: string) => {
    setEnRevision((prev) => prev.filter((p) => p.id !== id));
  }, []);

  useEffect(() => {
    let cancelado = false;

    const cargar = () => {
      Promise.all([
        listarEnRevision().catch(() => [] as PaginaEnRevision[]),
        listarAlertasCaducidad().then((r) => r.alerts, () => [] as AlertaCaducidad[]),
      ]).then(([pendientes, alertas]) => {
        if (cancelado) return;
        setEnRevision(pendientes);
        setCuentasPorVencer(alertas);
      });
    };

    cargar();

    const handleRevisionActualizada = (e: Event) => {
      if (cancelado) return;
      const custom = e as CustomEvent<{ slug?: string; id?: string }>;
      if (custom.detail?.slug || custom.detail?.id) {
        setEnRevision((prev) =>
          prev.filter((p) => {
            if (custom.detail?.id && p.id === custom.detail.id) return false;
            if (custom.detail?.slug && p.slug === custom.detail.slug) return false;
            return true;
          })
        );
      }
      cargar();
    };

    window.addEventListener('olo:revision-actualizada', handleRevisionActualizada);
    window.addEventListener('focus', cargar);

    return () => {
      cancelado = true;
      window.removeEventListener('olo:revision-actualizada', handleRevisionActualizada);
      window.removeEventListener('focus', cargar);
    };
  }, [pathname]);

  const totalAlertas = cuentasPorVencer.length + enRevision.length;

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }, [router]);

  // El globo de la campana de la barra superior del móvil: se apaga al abrir los avisos.
  const avisosSinVer = alertasVistas ? 0 : totalAlertas;

  return (
    <>
      <SidebarLayout
        className={className}
        navbar={
          // En el móvil: a la izquierda, quién está conectado (con su menú) y los
          // avisos; a la derecha, buscar y el tema. Las secciones, en la navegación
          // mobile de abajo.
          // Botones de 44 px y no los 32 de `NavbarItem`: son las acciones principales
          // de la barra en el móvil (2-convenciones §10.4).
          <Navbar>
            <NavbarSection className="min-w-0 gap-1">
              <Dropdown className="min-w-0">
                <DropdownButton className="flex min-h-11 min-w-0 max-w-full items-center gap-1.5 rounded-lg px-2 text-left text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 dark:text-[#f6f6f6] dark:hover:bg-zinc-800">
                  <span className="truncate">{userProfile?.name || 'Usuario'}</span>
                  <ChevronDownIcon className="size-4 shrink-0 text-zinc-500 dark:text-[#94a3b8]" />
                </DropdownButton>
                {/* Esquinas de arriba rectas: el menú sale pegado a la barra. */}
                <DropdownMenu className="min-w-56 rounded-t-none" anchor="bottom start">
                  <DropdownItem href="/admin/mi-perfil">
                    <UserIcon />
                    <DropdownLabel>Mi perfil</DropdownLabel>
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem onClick={handleLogout}>
                    <ArrowRightStartOnRectangleIcon />
                    <DropdownLabel>Cerrar sesión</DropdownLabel>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <button
                type="button"
                onClick={() => setIsAlertasOpen(true)}
                aria-label={avisosSinVer > 0 ? `Notificaciones, ${avisosSinVer} pendientes` : 'Notificaciones'}
                className={`relative shrink-0 ${BOTON_BARRA_MOVIL}`}
              >
                <BellIcon />
                {avisosSinVer > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#131b2f]"
                  >
                    {avisosSinVer}
                  </span>
                )}
              </button>
            </NavbarSection>
            <NavbarSpacer />
            <NavbarSection className="shrink-0 gap-1">
              <button type="button" onClick={() => setIsBuscarOpen(true)} aria-label="Buscar" className={BOTON_BARRA_MOVIL}>
                <MagnifyingGlassIcon />
              </button>
              <ThemeToggle className={BOTON_BARRA_MOVIL} />
            </NavbarSection>
          </Navbar>
        }
        navegacionMobile={<NavegacionMobilePanel
            pendientesRevision={enRevision.length}
            logo={iconoDelPanel(identidad)}
            logoEnBlancoEnOscuro={iconoEnBlancoEnOscuro(identidad)}
          />}
        sidebar={
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center justify-between w-full">
                {/* El de fábrica (SVG de /public) o el subido en Configuración: next/image no
                    aporta optimización aquí. En modo oscuro, en blanco según
                    `logoEnBlancoEnOscuro`.
                    `max-w-full object-contain`: un logo subido puede ser más ancho que la barra. */}
                <Link href="/" className="group cursor-pointer pt-7" title="Ir al sitio web">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoDelPanel(identidad)}
                    alt="OLO"
                    className={`h-16 max-w-full cursor-pointer object-contain object-left transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-md ${logoEnBlancoEnOscuro(identidad) ? 'dark:brightness-0 dark:invert' : ''}`}
                  />
                </Link>
              </div>
            </SidebarHeader>
            <SidebarBody>
              <SidebarSection>
                <SidebarItem
                  href="/admin/dashboard"
                  current={pathname.startsWith('/admin/dashboard')}
                  className="font-semibold"
                >
                  <HomeIcon />
                  <SidebarLabel>Dashboard</SidebarLabel>
                </SidebarItem>
                <SidebarGroup
                  label="Accesos"
                  icon={UserIcon}
                  prefixes={['/admin/users', '/admin/roles']}
                >
                  {(pathname) => (
                    <>
                      <SidebarItem
                        href="/admin/users"
                        current={pathname.startsWith('/admin/users')}
                        className="pl-11"
                      >
                        <SidebarLabel>Usuarios</SidebarLabel>
                      </SidebarItem>
                      <SidebarItem
                        href="/admin/roles"
                        current={pathname.startsWith('/admin/roles')}
                        className="pl-11"
                      >
                        <SidebarLabel>Roles y Permisos</SidebarLabel>
                      </SidebarItem>
                    </>
                  )}
                </SidebarGroup>
                <SidebarItem
                  href="/admin/revision"
                  current={pathname.startsWith('/admin/revision')}
                  className="font-semibold"
                >
                  <ClipboardDocumentCheckIcon />
                  <SidebarLabel>Páginas en revisión</SidebarLabel>
                  <ContadorSidebar cantidad={enRevision.length} />
                </SidebarItem>
                <SidebarItem
                  href="/admin/auditoria"
                  current={pathname.startsWith('/admin/auditoria')}
                  className="font-semibold"
                >
                  <ShieldCheckIcon />
                  <SidebarLabel>Auditoría</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                  href="/admin/respaldos"
                  current={pathname.startsWith('/admin/respaldos')}
                  className="font-semibold"
                >
                  <ArchiveBoxIcon />
                  <SidebarLabel>Respaldos</SidebarLabel>
                </SidebarItem>
              </SidebarSection>
              <SidebarSpacer />
              <SidebarSection>
                <SidebarItem
                  href="/admin/actualizaciones"
                  current={pathname.startsWith('/admin/actualizaciones')}
                  className="font-semibold"
                >
                  <ArrowUpTrayIcon />
                  <SidebarLabel>Actualizaciones</SidebarLabel>
                </SidebarItem>
              </SidebarSection>
            </SidebarBody>

            <div className="mx-2 flex flex-row items-center gap-1">
              <SidebarItem onClick={() => setIsBuscarOpen(true)} className="flex-1">
                <MagnifyingGlassIcon />
                <SidebarLabel>Buscar</SidebarLabel>
              </SidebarItem>
              <ThemeToggle className="shrink-0 flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-[#001631]/10 hover:text-zinc-900 dark:text-slate-400 dark:hover:bg-brand-interactive/10 dark:hover:text-brand-interactive transition-colors [&>svg]:size-5" />
            </div>

            <SidebarFooter className="flex flex-row items-center gap-1">
              <Dropdown className="flex-1 min-w-0">
                <DropdownButton as={SidebarItem} className="w-full justify-between">
                  <span className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="min-w-0">
                      <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-[#f6f6f6]">
                        {userProfile?.name || 'Usuario'}
                      </span>
                      <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-[#94a3b8]">
                        {userProfile?.email || 'cargando...'}
                      </span>
                    </span>
                  </span>
                  <ChevronUpIcon className="size-4 shrink-0 text-zinc-500" />
                </DropdownButton>
                <DropdownMenu className="min-w-64" anchor="top start">
                  <DropdownItem href="/admin/mi-perfil">
                    <UserIcon />
                    <DropdownLabel>Mi perfil</DropdownLabel>
                  </DropdownItem>
                  <DropdownItem href="/admin/dashboard/configuracion">
                    <Cog8ToothIcon />
                    <DropdownLabel>Configuración</DropdownLabel>
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem onClick={handleLogout}>
                    <ArrowRightStartOnRectangleIcon />
                    <DropdownLabel>Cerrar sesión</DropdownLabel>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <button
                type="button"
                onClick={() => setIsAlertasOpen(true)}
                className="relative shrink-0 p-2 rounded-lg text-zinc-500 hover:bg-[#001631]/10 hover:text-zinc-900 dark:text-slate-400 dark:hover:bg-brand-interactive/10 dark:hover:text-brand-interactive transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-interactive"
                aria-label="Notificaciones"
              >
                <div className="relative flex items-center justify-center">
                  <BellIcon className="size-5" />
                  {totalAlertas > 0 && !alertasVistas && (
                    <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-[#121824]">
                      {totalAlertas}
                    </span>
                  )}
                </div>
              </button>
            </SidebarFooter>
          </Sidebar>
        }
      >
        <RouteTransition>{children}</RouteTransition>
      </SidebarLayout>
      {isBuscarOpen && <BuscadorModal onClose={() => setIsBuscarOpen(false)} />}
      <ModalAlertas
        abierto={isAlertasOpen}
        onCerrar={() => {
          setIsAlertasOpen(false);
          setAlertasVistas(true);
        }}
        cuentasPorVencer={cuentasPorVencer}
        enRevision={enRevision}
        onDismissCuenta={handleDismissCuenta}
        onDismissRevision={handleDismissRevision}
      />
    </>
  );
}

/**
 * Título, subtítulo y el enlace a la bitácora completa de la tarjeta «Actividad
 * Reciente». Se repite igual en sus tres estados (con datos, sin acceso/con error y
 * vacía), así que sale a un componente en vez de copiarlo tres veces.
 */
function CabeceraActividad({ sinAccesoAuditoria }: { sinAccesoAuditoria: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="admin-subtitle text-zinc-950 dark:text-[#f6f6f6]">Actividad reciente</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-[#94a3b8]">
          Consulta el resumen de la bitácora más reciente.
        </p>
      </div>
      {!sinAccesoAuditoria && (
        <Link
          href="/admin/auditoria"
          className="shrink-0 text-sm font-medium text-[#4C7A1C] hover:underline dark:text-[#9ED65C]"
        >
          Ver más
        </Link>
      )}
    </div>
  );
}

export function PanelGeneralDashboard() {
  const { users, error, fetchUsers } = useUsuarios();
  const [loading, setLoading] = useState(true);
  const [actividad, setActividad] = useState<RegistroAuditoria[]>([]);
  const [errorActividad, setErrorActividad] = useState<Error | null>(null);
  const [paginaActividad, setPaginaActividad] = useState(1);
  // Solo en el dashboard: 12 en vez de los 15 de Roles/Usuarios/Auditoría, para que
  // la tarjeta de Actividad Reciente no crezca más que las demás del mismo grid.
  const [itemsPorPaginaActividad, setItemsPorPaginaActividad] = useState(12);
  const [paginasPublicadas, setPaginasPublicadas] = useState<ResumenPaginasPublicadas | null>(null);
  const [errorPaginas, setErrorPaginas] = useState<string | null>(null);


  useEffect(() => {
    let cancelado = false;
    (async () => {
      // En paralelo: que una fuente lenta no retrase a las demás.
      const [, registros, publicadas] = await Promise.all([
        fetchUsers(),
        listarAuditoria({}, 1, CAMBIOS_RECIENTES).then(
          (respuesta) => respuesta.registros,
          (err: unknown) => {
            if (!cancelado) {
              setErrorActividad(
                err instanceof Error ? err : new Error('No se pudo cargar la actividad reciente.'),
              );
            }
            return [] as RegistroAuditoria[];
          },
        ),
        // El recuento de páginas no es crítico para el panel: si falla, su tarjeta lo
        // dice sola y el resto del dashboard se pinta igual.
        resumenDePaginasPublicadas().then(
          (resumen) => sinPlantilla(resumen),
          (err: unknown) => {
            if (!cancelado) {
              setErrorPaginas(
                err instanceof Error ? err.message : 'No se pudo cargar el recuento de páginas.',
              );
            }
            return null;
          },
        ),
      ]);
      if (cancelado) return;
      setActividad(registros || []);
      setPaginasPublicadas(publicadas);
      setLoading(false);
    })();
    return () => {
      cancelado = true;
    };
  }, [fetchUsers]);

  /** El 403 por rol no es una avería: se explica sin alarmar y sin enlace muerto. */
  const sinAccesoAuditoria = errorActividad instanceof ErrorAuditoria && errorActividad.sinAcceso;

  const totalPaginasActividad = Math.max(1, Math.ceil(actividad.length / itemsPorPaginaActividad));
  const paginaActualActividad = Math.min(paginaActividad, totalPaginasActividad);
  const actividadPaginada = actividad.slice(
    (paginaActualActividad - 1) * itemsPorPaginaActividad,
    paginaActualActividad * itemsPorPaginaActividad,
  );

  if (loading) {
    return <CargandoSeccion label="Cargando panel general..." />;
  }

  return (
    <div className="px-4 py-6 sm:p-6 lg:p-8">
      <EncabezadoPanel
        titulo="Dashboard"
        descripcion="Resumen de tareas pendientes y gestión del observatorio."
        className="mb-8"
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </p>
      )}

      {/* Tres en fila solo desde 1440 px (pedido del usuario, 2026-10-10): por debajo, con
          la barra lateral, las tres quedaban estrechas y el árbol de páginas cortaba los
          títulos. Entonces la fila es «Páginas publicadas» y «Visitas», y «Usuarios» baja a
          una fila propia a todo el ancho. En el móvil, una debajo de otra, como antes.
          `min-[90rem]` (1440 px) y no `min-[1440px]`: en px, Tailwind no sabe ordenarlo
          con `sm:` (en rem) y lo ponía antes, así que `sm:grid-cols-2` le ganaba siempre. */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 min-[90rem]:grid-cols-3">
        <TarjetaPaginasPublicadas resumen={paginasPublicadas} error={errorPaginas} />
        <TarjetaVisitas resumen={paginasPublicadas} error={errorPaginas} />
        <div className="sm:col-span-2 min-[90rem]:col-span-1">
          <TarjetaUsuarios users={users} loading={loading} />
        </div>
      </div>

      <div className="w-full">
        {/* Mismo patrón de tarjeta que Auditoría/Roles/Usuarios (borde + fondo +
            sombra al pasar el ratón), pero sin `p-4`: el título, la lista y el
            paginador llevan su propio espaciado, y las líneas entre registros van
            de borde a borde. */}
        <div className="min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155]">
          {errorActividad ? (
            <div className="p-5">
              <CabeceraActividad sinAccesoAuditoria={sinAccesoAuditoria} />
              <p
                className={
                  sinAccesoAuditoria
                    ? 'mt-3 text-sm text-zinc-500 dark:text-[#94a3b8]'
                    : 'mt-3 text-sm text-red-600 dark:text-red-300'
                }
              >
                {errorActividad.message}
              </p>
            </div>
          ) : (actividad || []).length > 0 ? (
            <>
              <div className="p-5">
                <CabeceraActividad sinAccesoAuditoria={sinAccesoAuditoria} />
              </div>
              {/* Una lista con la frase entera de cada registro, en todas las pantallas
                  (pedido del usuario, 2026-10-10): «El usuario David Tejada hizo la acción
                  de [Autenticación]: inició sesión en el sitio web el 10 de octubre de 2026
                  a las 5:41 p. m.». Antes era una tabla de cuatro columnas que en el móvil
                  y la tablet pasaba a acordeón; ahora no hay nada que desplegar. La frase es
                  la de Auditoría (`FraseDeRegistro`), para que las dos lean igual. */}
              <ul
                aria-label="Actividad reciente"
                className="divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700"
              >
                {actividadPaginada.map((registro) => (
                  <li key={registro.id} className="px-5 py-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    <FraseDeRegistro registro={registro} nombre={registro.usuarioNombre} abierta />
                  </li>
                ))}
              </ul>

              <Paginador
                pagina={paginaActualActividad}
                totalPaginas={totalPaginasActividad}
                onCambiarPagina={setPaginaActividad}
                total={actividad.length}
                porPagina={itemsPorPaginaActividad}
                onCambiarPorPagina={(n) => {
                  setItemsPorPaginaActividad(n);
                  setPaginaActividad(1);
                }}
                etiqueta="registros"
                opciones={[12, 30, 60, 100]}
                className="px-5"
              />
            </>
          ) : (
            <div className="p-5">
              <CabeceraActividad sinAccesoAuditoria={sinAccesoAuditoria} />
              <p className="mt-3 text-sm text-zinc-500 dark:text-[#94a3b8]">No hay actividad reciente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

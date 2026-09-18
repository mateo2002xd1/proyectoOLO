'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
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
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/shared/ui/organisms/navbar';
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
  enlaceAlEditor,
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
  COLOR_ACCION,
  etiquetaDeAccion,
  etiquetaDeEntidad,
  type RegistroAuditoria,
} from '@/features/administracion/auditoria';
import { useUsuarios, mensajeDeError, type User } from '../hooks/use-usuarios';
import { listarAlertasCaducidad, type AlertaCaducidad } from '../services/alertas-caducidad.service';

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
          : 'text-zinc-600 hover:bg-[#001631]/10 hover:text-[#7DB728] dark:text-slate-400 dark:hover:bg-brand-interactive/10 dark:hover:text-brand-interactive [&>svg]:text-zinc-500 dark:[&>svg]:text-slate-400'
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

/** Solo los nombres de los campos tocados: el antes/después vive en la bitácora. */
const camposTocados = (registro: RegistroAuditoria) =>
  registro.camposModificados.map(({ campo }) => campo).join(', ');

/**
 * La cola de revisión exige permiso para publicar (`pagina.routes.ts`), así que a
 * un editor le responde 403. Eso no es una avería: es que estas alertas no son
 * suyas, y decírselo así evita que reporte un error que no existe.
 */
function mensajeDeRevision(err: unknown): string {
  const status = (err as { response?: { status?: number } })?.response?.status;
  return status === 403
    ? 'Tu rol no aprueba páginas, así que no recibes estas alertas.'
    : 'No se pudieron cargar las alertas de páginas en revisión.';
}

/** Fecha corta: la tarjeta es angosta y la hora exacta se consulta en Auditoría. */
const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

/** Urgencia visual de una cuenta por vencer: lo inminente se distingue de un vistazo. */
const colorDiasRestantes = (dias: number) =>
  dias <= 3
    ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
    : dias <= 7
      ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200'
      : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';

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
        className="flex max-h-[88vh] min-h-[22rem] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#121824]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="alertas-titulo"
      >
        <header className="border-b border-zinc-100 px-8 py-6 dark:border-zinc-800/80">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 id="alertas-titulo" className="admin-subtitle text-xl text-zinc-900 dark:text-[#f6f6f6]">
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

        <div className="flex-1 overflow-y-auto p-8">
          {total === 0 ? (
            <p className="py-12 text-center text-base text-zinc-500 dark:text-[#94a3b8]">
              No hay alertas pendientes en este momento.
            </p>
          ) : (
            <div className="space-y-3">
              {cuentasPorVencer.map((a) => (
                <div
                  key={a.userId || a.email}
                  className="group flex h-11 w-full items-center gap-2 rounded-full border border-amber-200 bg-amber-50 pl-1.5 pr-2 dark:border-amber-900/40 dark:bg-amber-900/15"
                >
                  <span className="shrink-0 rounded-full bg-amber-200/80 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-800/60 dark:text-amber-100">
                    Por vencer
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm text-amber-800 dark:text-amber-200">
                    <Link href="/admin/users" className="font-medium underline hover:no-underline">
                      {a.email}
                    </Link>
                    {' '}vence en {a.daysLeft} día{a.daysLeft !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={() => onDismissCuenta(a.email)}
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-amber-600 hover:bg-amber-200/70 dark:text-amber-300 dark:hover:bg-amber-900/50"
                    title="Marcar como solucionada"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </button>
                </div>
              ))}

              {enRevision.map((p) => (
                <div
                  key={p.id}
                  className="group flex h-11 w-full items-center gap-2 rounded-full border border-blue-200 bg-blue-50 pl-1.5 pr-2 dark:border-blue-900/40 dark:bg-blue-900/15"
                >
                  <span className="shrink-0 rounded-full bg-blue-200/80 px-2.5 py-1 text-xs font-semibold text-blue-900 dark:bg-blue-800/60 dark:text-blue-100">
                    En revisión
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm text-blue-800 dark:text-blue-200">
                    <Link href="/admin/revision" className="font-medium underline hover:no-underline">
                      {p.titulo}
                    </Link>
                  </p>
                  <button
                    onClick={() => onDismissRevision(p.id)}
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-blue-600 hover:bg-blue-200/70 dark:text-blue-300 dark:hover:bg-blue-900/50"
                    title="Marcar como solucionada"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
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
  className,
}: {
  children: React.ReactNode;
  userProfile?: { name: string; email: string };
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isBuscarOpen, setIsBuscarOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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

  return (
    <>
      <SidebarLayout
        className={className}
        isSidebarOpen={isMobileSidebarOpen}
        onCloseSidebar={() => setIsMobileSidebarOpen(false)}
        navbar={
          <Navbar>
            <NavbarSection>
              <NavbarItem
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Abrir menú"
                className="lg:hidden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </NavbarItem>
              <NavbarItem onClick={() => setIsBuscarOpen(true)} aria-label="Buscar">
                <MagnifyingGlassIcon />
              </NavbarItem>
              <ThemeToggle />
              <NavbarItem onClick={() => setIsAlertasOpen(true)} aria-label="Notificaciones" className="relative cursor-pointer">
                <BellIcon className="size-5 text-zinc-500 dark:text-zinc-400" />
                {totalAlertas > 0 && !alertasVistas && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {totalAlertas}
                  </span>
                )}
              </NavbarItem>
            </NavbarSection>
            <NavbarSpacer />
            <NavbarSection>
              <Dropdown>
                <DropdownMenu className="min-w-64" anchor="bottom end">
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
            </NavbarSection>
          </Navbar>
        }
        sidebar={
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center justify-between w-full">
                {/* SVG estático servido desde /public: next/image no aporta optimización aquí. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <Link href="/" className="group cursor-pointer pt-7" title="Ir al sitio web">
                  <img src="/assets/logos/olo-logo-horizontal.svg" alt="OLO" className="h-16 transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-md dark:brightness-0 dark:invert cursor-pointer" />
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

            <div className="max-lg:hidden mx-2 flex flex-row items-center gap-1">
              <SidebarItem onClick={() => setIsBuscarOpen(true)} className="flex-1">
                <MagnifyingGlassIcon />
                <SidebarLabel>Buscar</SidebarLabel>
              </SidebarItem>
              <ThemeToggle className="shrink-0 flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-[#001631]/10 hover:text-zinc-900 dark:text-slate-400 dark:hover:bg-brand-interactive/10 dark:hover:text-brand-interactive transition-colors [&>svg]:size-5" />
            </div>

            <SidebarFooter className="max-lg:hidden flex flex-row items-center gap-1">
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-[#0b1121]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-600" />
          <p className="text-sm text-zinc-500">Cargando panel general...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="admin-header text-zinc-950 dark:text-[#f6f6f6]">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Resumen de tareas pendientes y gestión del observatorio.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TarjetaPaginasPublicadas resumen={paginasPublicadas} error={errorPaginas} />
        <TarjetaVisitas resumen={paginasPublicadas} error={errorPaginas} />
        <TarjetaUsuarios users={users} loading={loading} />
      </div>

      <div className="w-full">
        <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155]">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="admin-subtitle text-zinc-950 dark:text-[#f6f6f6]">Actividad Reciente</h2>
            {!sinAccesoAuditoria && (
              <Link
                href="/admin/auditoria"
                className="shrink-0 text-sm font-medium text-[#4C7A1C] hover:underline dark:text-[#9ED65C]"
              >
                Ver más
              </Link>
            )}
          </div>
          {errorActividad ? (
            <p
              className={
                sinAccesoAuditoria
                  ? 'text-sm text-zinc-500 dark:text-[#94a3b8]'
                  : 'text-sm text-red-600 dark:text-red-300'
              }
            >
              {errorActividad.message}
            </p>
          ) : (actividad || []).length > 0 ? (
            <>
              {/* Mismas columnas que la bitácora, en versión angosta: la tarjeta ocupa
                  media pantalla, así que la tabla desborda a scroll en vez de apretarse.
                  `overflow-y-hidden` junto al `-x-auto` es lo que hace falta para que el
                  redondeo del contenedor recorte el encabezado en las cuatro esquinas:
                  con un solo eje explícito, algunos navegadores no lo clipan igual. */}
              <div className="overflow-x-auto overflow-y-hidden rounded-lg">
                <table className="w-full min-w-[34rem] text-left text-sm">
                  <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-[#131b2f]">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-medium">Fecha y hora</th>
                      <th scope="col" className="px-3 py-2 font-medium">Usuario</th>
                      <th scope="col" className="px-3 py-2 font-medium">Acción</th>
                      <th scope="col" className="px-3 py-2 font-medium">Cambios</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                    {actividadPaginada.map((registro) => (
                      <tr key={registro.id}>
                        <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-600 dark:text-zinc-300">
                          {fechaCorta(registro.fecha)}
                        </td>
                        <td className="max-w-[9rem] truncate px-3 py-3 text-zinc-900 dark:text-[#f6f6f6]">
                          {registro.usuarioNombre ?? <span className="text-zinc-500">Sin usuario</span>}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${COLOR_ACCION[registro.accion] ?? ''}`}
                          >
                            {etiquetaDeAccion(registro.accion)}
                          </span>
                        </td>
                        <td
                          className="max-w-[12rem] truncate px-3 py-3 text-zinc-500 dark:text-[#94a3b8]"
                          title={camposTocados(registro)}
                        >
                          {etiquetaDeEntidad(registro.entidadTipo)}
                          {camposTocados(registro) && ` · ${camposTocados(registro)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
                className="mt-1 px-0"
              />
            </>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">No hay actividad reciente.</p>
          )}
        </div>
      </div>
    </div>
  );
}

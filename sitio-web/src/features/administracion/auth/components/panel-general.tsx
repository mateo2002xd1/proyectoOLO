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
  HomeIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/20/solid';
import { ThemeToggle } from '@/shared/ui/molecules/theme-toggle';
import { RouteTransition } from '@/shared/ui/atoms/RouteTransition';
import {
  enlaceAlEditor,
  listarEnRevision,
  resumenDePaginasPublicadas,
  type PaginaEnRevision,
  type ResumenPaginasPublicadas,
} from '@/features/paginas';
import { TarjetaPaginasPublicadas } from './tarjeta-paginas-publicadas';
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
        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition [&>svg]:size-5 [&>svg]:shrink-0 ${
          isActive
            ? 'bg-zinc-100 font-semibold text-zinc-900 dark:bg-brand-interactive/20 dark:text-brand-interactive [&>svg]:text-zinc-900 dark:[&>svg]:text-brand-interactive'
            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-slate-400 dark:hover:bg-brand-interactive/10 dark:hover:text-brand-interactive [&>svg]:text-zinc-500 dark:[&>svg]:text-slate-400'
        }`}
        aria-expanded={open}
      >
        <Icon className="shrink-0" />
        <span className="flex-1 truncate text-left">{label}</span>
        <ChevronDownIcon
          className={`size-4 shrink-0 text-zinc-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
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


/** Cambios que caben en la tarjeta del panel; el resto se lee en Auditoría. */
const CAMBIOS_RECIENTES = 15;

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

/** Usuarios agrupados por rol, de mayor a menor. Los que no tienen rol asignado
 *  se agrupan aparte en vez de descartarse: si aparecen, es un dato a corregir. */
function contarUsuariosPorRol(users: User[]): { rol: string; total: number }[] {
  const conteo = new Map<string, number>();
  for (const user of users) {
    const rol = user.role?.name || 'Sin rol';
    conteo.set(rol, (conteo.get(rol) ?? 0) + 1);
  }
  return [...conteo.entries()]
    .map(([rol, total]) => ({ rol, total }))
    .sort((a, b) => b.total - a.total || a.rol.localeCompare(b.rol, 'es'));
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
      onClick={(e) => {
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
            <div className="space-y-4">
              {cuentasPorVencer.map((a) => (
                <div
                  key={a.userId || a.email}
                  className="relative group block rounded-xl border border-amber-100 bg-amber-50/50 p-5 pr-14 dark:border-amber-900/30 dark:bg-amber-900/10"
                >
                  <button
                    onClick={() => onDismissCuenta(a.email)}
                    className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 rounded-md text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Marcar como solucionada"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </button>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-amber-800 dark:text-amber-200">
                      Cuenta por vencer: {a.email}
                    </p>
                    <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/70">
                      Vence en {a.daysLeft} día{a.daysLeft !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}

              {enRevision.map((p) => (
                <div
                  key={p.id}
                  className="relative group block rounded-xl border border-blue-100 bg-blue-50/50 p-5 pr-14 dark:border-blue-900/30 dark:bg-blue-900/10"
                >
                  <button
                    onClick={() => onDismissRevision(p.id)}
                    className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 rounded-md text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Marcar como solucionada"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                      <ClipboardDocumentCheckIcon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold text-blue-800 dark:text-blue-200">
                        Página en revisión
                      </p>
                      <p className="mt-1 truncate text-sm text-blue-700/80 dark:text-blue-300/70">
                        {p.titulo}
                      </p>
                    </div>
                  </div>
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
    Promise.all([
      listarEnRevision().catch(() => [] as PaginaEnRevision[]),
      listarAlertasCaducidad().then((r) => r.alerts, () => [] as AlertaCaducidad[])
    ]).then(([pendientes, alertas]) => {
      if (cancelado) return;
      setEnRevision(pendientes);
      setCuentasPorVencer(alertas);
    });
    return () => { cancelado = true; };
  }, []);

  const totalAlertas = cuentasPorVencer.length + enRevision.length;

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }, [router]);

  return (
    <>
      <ThemeToggle />
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
                <SidebarItem href="/admin/dashboard">
                  <HomeIcon />
                  <SidebarLabel>Dashboard</SidebarLabel>
                </SidebarItem>
                <SidebarGroup
                  label="Usuarios"
                  icon={UserIcon}
                  prefixes={['/admin/users', '/admin/roles']}
                >
                  {(pathname) => (
                    <>
                      <SidebarItem
                        href="/admin/users"
                        current={pathname.startsWith('/admin/users')}
                        className="pl-9"
                      >
                        <SidebarLabel>Usuarios</SidebarLabel>
                      </SidebarItem>
                      <SidebarItem
                        href="/admin/roles"
                        current={pathname.startsWith('/admin/roles')}
                        className="pl-9"
                      >
                        <SidebarLabel>Roles y Permisos</SidebarLabel>
                      </SidebarItem>
                    </>
                  )}
                </SidebarGroup>
                <SidebarItem href="/admin/revision">
                  <ClipboardDocumentCheckIcon />
                  <SidebarLabel>Páginas en revisión</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="/admin/auditoria">
                  <ShieldCheckIcon />
                  <SidebarLabel>Auditoría</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="/admin/respaldos">
                  <ArchiveBoxIcon />
                  <SidebarLabel>Respaldos</SidebarLabel>
                </SidebarItem>
              </SidebarSection>
              <SidebarSpacer />
              <SidebarSection>
                <SidebarItem href="/admin/dashboard/soporte">
                  <QuestionMarkCircleIcon />
                  <SidebarLabel>Soporte</SidebarLabel>
                </SidebarItem>
              </SidebarSection>
            </SidebarBody>

            <SidebarSection className="max-lg:hidden mx-2">
              <SidebarItem onClick={() => setIsBuscarOpen(true)}>
                <MagnifyingGlassIcon />
                <SidebarLabel>Buscar</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

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
                className="relative shrink-0 p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-slate-400 dark:hover:bg-brand-interactive/10 dark:hover:text-brand-interactive transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-interactive"
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
          (resumen) => resumen,
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

  const usuariosPorRol = useMemo(() => contarUsuariosPorRol(users), [users]);

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

  // `paginas` sale de aquí: tiene tarjeta propia (`TarjetaPaginasPublicadas`) porque
  // además del total despliega el detalle por aplicación con enlace a cada página.
  // Hasta ahora valía `0` escrito a mano, que se leía como un dato real y no lo era.
  const statsEntries = Object.entries({
    usuarios: users.length,
    visitas: 0,
  });
  const statsLabels: Record<string, string> = {
    usuarios: 'Usuarios',
    paginas: 'Páginas',
    alertas: 'Alertas',
    visitas: 'Visitas',
    publicaciones: 'Publicaciones',
    revisiones: 'Revisiones',
  };

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
        {statsEntries.map(([key, value]) => (
          <div key={key} className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155]">
            <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">{statsLabels[key] || key}</p>
            <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-[#f6f6f6]">{value}</p>
            {key === 'usuarios' && usuariosPorRol.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-zinc-100 pt-2 dark:border-[#7db828]/20">
                {usuariosPorRol.map(({ rol, total }) => (
                  <li key={rol} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-zinc-500 dark:text-[#94a3b8]">{rol}</span>
                    <span className="font-semibold tabular-nums text-zinc-700 dark:text-[#cbd5e1]">{total}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
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
            /* Mismas columnas que la bitácora, en versión angosta: la tarjeta ocupa
               media pantalla, así que la tabla desborda a scroll en vez de apretarse. */
            <div className="overflow-x-auto rounded-lg">
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
                  {actividad.map((registro) => (
                    <tr key={registro.id}>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300">
                        {fechaCorta(registro.fecha)}
                      </td>
                      <td className="max-w-[9rem] truncate px-3 py-2 text-zinc-900 dark:text-[#f6f6f6]">
                        {registro.usuarioNombre ?? <span className="text-zinc-500">Sin usuario</span>}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${COLOR_ACCION[registro.accion] ?? ''}`}
                        >
                          {etiquetaDeAccion(registro.accion)}
                        </span>
                      </td>
                      <td
                        className="max-w-[12rem] truncate px-3 py-2 text-zinc-500 dark:text-[#94a3b8]"
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
          ) : (
            <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">No hay actividad reciente.</p>
          )}
        </div>
      </div>
    </div>
  );
}

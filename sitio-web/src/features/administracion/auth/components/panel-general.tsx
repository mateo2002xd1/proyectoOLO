'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  ChevronUpIcon,
  Cog8ToothIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/16/solid';
import {
  ClipboardDocumentCheckIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/20/solid';
import { ThemeToggle } from '@/shared/ui/molecules/theme-toggle';
import { RouteTransition } from '@/shared/ui/atoms/RouteTransition';
import { enlaceAlEditor, listarEnRevision, type PaginaEnRevision } from '@/features/paginas';
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

/** Editor de la intranet: configurable por entorno, nunca fijo a localhost. */
const INTRANET_EDITOR_URL =
  process.env.NEXT_PUBLIC_INTRANET_EDITOR_URL || 'http://localhost:3001/editor/inicio';

/** Cambios que caben en la tarjeta del panel; el resto se lee en Auditoría. */
const CAMBIOS_RECIENTES = 7;

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

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }, [router]);

  return (
    <>
      <ThemeToggle />
      <SidebarLayout
        className={className}
        navbar={
          <Navbar>
            <NavbarSection>
              <NavbarItem href="/admin/dashboard/buscar" aria-label="Buscar">
                <MagnifyingGlassIcon />
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
                  <DropdownItem href="/admin/dashboard/privacidad">
                    <ShieldCheckIcon />
                    <DropdownLabel>Política de privacidad</DropdownLabel>
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
                <Link href="/" className="group cursor-pointer" title="Ir al sitio web">
                  <img src="/assets/logos/olo-logo-horizontal.svg" alt="OLO" className="h-[4.5rem] pb-3 transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-md dark:brightness-0 dark:invert cursor-pointer" />
                </Link>
              </div>
            </SidebarHeader>
            <SidebarBody>
              <SidebarSection>
                <SidebarItem href="/admin/dashboard">
                  <HomeIcon />
                  <SidebarLabel>Dashboard</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="/admin/users">
                  <UserIcon />
                  <SidebarLabel>Usuarios</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="/admin/revision">
                  <ClipboardDocumentCheckIcon />
                  <SidebarLabel>Páginas en revisión</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="/admin/auditoria">
                  <ShieldCheckIcon />
                  <SidebarLabel>Auditoría</SidebarLabel>
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

            <SidebarSection className="max-lg:hidden mx-2 mb">
              <SidebarItem href="/admin/dashboard/buscar">
                <MagnifyingGlassIcon />
                <SidebarLabel>Buscar</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarFooter className="max-lg:hidden">
              <Dropdown>
                <DropdownButton as={SidebarItem}>
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
                  <ChevronUpIcon />
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
                  <DropdownItem href="/admin/dashboard/privacidad">
                    <ShieldCheckIcon />
                    <DropdownLabel>Política de privacidad</DropdownLabel>
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem onClick={handleLogout}>
                    <ArrowRightStartOnRectangleIcon />
                    <DropdownLabel>Cerrar sesión</DropdownLabel>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </SidebarFooter>
          </Sidebar>
        }
      >
        <RouteTransition>{children}</RouteTransition>
      </SidebarLayout>
    </>
  );
}

export function PanelGeneralDashboard() {
  const { users, error, fetchUsers } = useUsuarios();
  const [loading, setLoading] = useState(true);
  const [actividad, setActividad] = useState<RegistroAuditoria[]>([]);
  const [errorActividad, setErrorActividad] = useState<Error | null>(null);
  const [enRevision, setEnRevision] = useState<PaginaEnRevision[]>([]);
  const [errorRevision, setErrorRevision] = useState<string | null>(null);
  const [cuentasPorVencer, setCuentasPorVencer] = useState<AlertaCaducidad[]>([]);
  const [errorCuentasPorVencer, setErrorCuentasPorVencer] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      // En paralelo: que una fuente lenta no retrase a las demás.
      const [, registros, pendientes, alertasCaducidad] = await Promise.all([
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
        listarEnRevision().catch((err: unknown) => {
          if (!cancelado) setErrorRevision(mensajeDeRevision(err));
          return [] as PaginaEnRevision[];
        }),
        listarAlertasCaducidad().then(
          (respuesta) => respuesta.alerts,
          (err: unknown) => {
            if (!cancelado) {
              setErrorCuentasPorVencer(mensajeDeError(err, 'No se pudieron cargar las cuentas próximas a vencer.'));
            }
            return [] as AlertaCaducidad[];
          },
        ),
      ]);
      if (cancelado) return;
      setActividad(registros);
      setEnRevision(pendientes);
      setCuentasPorVencer(alertasCaducidad);
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

  const statsEntries = Object.entries({
    usuarios: users.length,
    paginas: 0,
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

      {/* Action Buttons for Editors */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link
          href={enlaceAlEditor('inicio', '/admin/dashboard')}
          className="group flex flex-col justify-center gap-1 rounded-xl border border-zinc-200 bg-white p-5 transition-all duration-200 ease-out hover:translate-x-1 hover:border-brand/40 hover:bg-brand/10 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-brand/40 dark:hover:bg-brand/10"
        >
          <h3 className="font-semibold text-zinc-950 group-hover:text-[#4C7A1C] dark:text-[#f6f6f6] dark:group-hover:text-[#9ED65C]">
            Editar Sitio Web
          </h3>
          <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">
            Abre el editor visual Puck para el sitio público principal
          </p>
        </Link>

        <a
          href={INTRANET_EDITOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col justify-center gap-1 rounded-xl border border-zinc-200 bg-white p-5 transition-all duration-200 ease-out hover:translate-x-1 hover:border-[#011A39]/40 hover:bg-[#011A39]/10 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#011A39]/40 dark:hover:bg-[#011A39]/20"
        >
          <h3 className="font-semibold text-zinc-950 group-hover:text-[#011A39] dark:text-[#f6f6f6] dark:group-hover:text-[#8FA8C9]">
            Editar Intranet
          </h3>
          <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">
            Abre el editor visual Puck para el sistema de Intranet
          </p>
        </a>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155]">
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
          ) : actividad.length > 0 ? (
            /* Mismas columnas que la bitácora, en versión angosta: la tarjeta ocupa
               media pantalla, así que la tabla desborda a scroll en vez de apretarse. */
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-[#7db828]/30">
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

        <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155]">
          <h2 className="admin-subtitle mb-4 text-zinc-950 dark:text-[#f6f6f6]">Alertas</h2>

          <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-[#cbd5e1]">Páginas en revisión</h3>
          {errorRevision ? (
            <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">{errorRevision}</p>
          ) : enRevision.length > 0 ? (
            /* Quién envió, qué ruta y qué versión: lo justo para decidir si abrir
               la cola. Aprobar o rechazar se hace en Páginas en revisión. */
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-[#7db828]/30">
              <table className="w-full min-w-[30rem] text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-[#131b2f]">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">Usuario</th>
                    <th scope="col" className="px-3 py-2 font-medium">Ruta</th>
                    <th scope="col" className="px-3 py-2 font-medium">Versión</th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      <span className="sr-only">Revisar</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {enRevision.map((pagina) => (
                    <tr key={pagina.id}>
                      <td className="max-w-[9rem] truncate px-3 py-2 text-zinc-900 dark:text-[#f6f6f6]">
                        {pagina.autor?.nombre ?? <span className="text-zinc-500">Sin autor</span>}
                      </td>
                      <td
                        className="max-w-[10rem] truncate px-3 py-2 text-zinc-600 dark:text-zinc-300"
                        title={`/${pagina.slug}`}
                      >
                        /{pagina.slug}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 tabular-nums text-zinc-600 dark:text-zinc-300">
                        v{pagina.numeroVersion}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href="/admin/revision"
                          className="inline-flex items-center rounded-lg bg-brand-interactive px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-interactive-hover"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">
              No hay páginas esperando revisión.
            </p>
          )}

          <h3 className="mb-2 mt-6 text-sm font-medium text-zinc-700 dark:text-[#cbd5e1]">
            Cuentas próximas a vencer
          </h3>
          {errorCuentasPorVencer ? (
            <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">{errorCuentasPorVencer}</p>
          ) : cuentasPorVencer.length > 0 ? (
            /* Quién, con qué correo y en cuántos días: lo justo para decidir si
               renovar. Cambiar la fecha de caducidad se hace en Usuarios. */
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-[#7db828]/30">
              <table className="w-full min-w-[26rem] text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-[#131b2f]">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">Usuario</th>
                    <th scope="col" className="px-3 py-2 font-medium">Correo</th>
                    <th scope="col" className="px-3 py-2 font-medium">Días faltantes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {cuentasPorVencer.map((cuenta) => (
                    <tr key={cuenta.userId}>
                      <td className="max-w-[9rem] truncate px-3 py-2 text-zinc-900 dark:text-[#f6f6f6]">
                        {cuenta.name}
                      </td>
                      <td className="max-w-[11rem] truncate px-3 py-2 text-zinc-600 dark:text-zinc-300" title={cuenta.email}>
                        {cuenta.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums ${colorDiasRestantes(cuenta.daysLeft)}`}
                        >
                          {cuenta.daysLeft} {cuenta.daysLeft === 1 ? 'día' : 'días'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">
              No hay cuentas próximas a vencer.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

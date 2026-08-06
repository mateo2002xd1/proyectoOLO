'use client';

import { useEffect, useState, useCallback } from 'react';
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
  InboxIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/20/solid';
import { ThemeToggle } from '@/shared/ui/molecules/theme-toggle';
import { enlaceAlEditor } from '@/features/paginas';

/** Editor de la intranet: configurable por entorno, nunca fijo a localhost. */
const INTRANET_EDITOR_URL =
  process.env.NEXT_PUBLIC_INTRANET_EDITOR_URL || 'http://localhost:3001/editor/inicio';

type PanelData = {
  stats: Record<string, number>;
  alerts: { id: string; title: string; type: string; message: string; date: string }[];
  recentActivity: { id: string; action: string; user: string; date: string; description: string }[];
};

export function PanelGeneralLayout({ children, userProfile }: { children: React.ReactNode; userProfile?: { name: string; email: string } }) {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/auth/login');
  }, [router]);

  return (
    <>
      <ThemeToggle />
      <SidebarLayout
        navbar={
          <Navbar>
            <NavbarSection>
              <NavbarItem href="/admin/dashboard/buscar" aria-label="Buscar">
                <MagnifyingGlassIcon />
              </NavbarItem>
              <NavbarItem href="/admin/dashboard/inbox" aria-label="Bandeja de entrada">
                <InboxIcon />
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
                <img src="/asset/logos/olo-logo-horizontal.svg" alt="OLO" className="h-[4.5rem] pb-3 dark:brightness-0 dark:invert" />
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
              <SidebarItem href="/admin/dashboard/inbox">
                <InboxIcon />
                <SidebarLabel>Bandeja de entrada</SidebarLabel>
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
        {children}
      </SidebarLayout>
    </>
  );
}

export function PanelGeneralDashboard() {
  const [data, setData] = useState<PanelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      // Simular carga de datos para evitar el 404 del endpoint de páginas públicas
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (cancelado) return;
      setData({ stats: { usuarios: 0, paginas: 0, alertas: 0, visitas: 0 }, alerts: [], recentActivity: [] });
      setLoading(false);
    })();
    return () => {
      cancelado = true;
    };
  }, []);

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

  const statsEntries = data?.stats ? Object.entries(data.stats) : [];
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
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-[#f6f6f6]">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Resumen de tareas pendientes y gestión del observatorio.
        </p>
      </div>

      {/* Action Buttons for Editors */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link
          href={enlaceAlEditor('inicio', '/admin/dashboard')}
          className="group flex flex-col justify-center gap-1 rounded-xl border border-zinc-200 bg-white p-5 transition-all duration-200 ease-out hover:translate-x-1 hover:border-[#7DB829]/40 hover:bg-[#7DB829]/10 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#7DB829]/40 dark:hover:bg-[#7DB829]/10"
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

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsEntries.length > 0 ? (
          statsEntries.map(([key, value]) => (
            <div key={key} className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155]">
              <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">{statsLabels[key] || key}</p>
              <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-[#f6f6f6]">{value}</p>
            </div>
          ))
        ) : (
          <>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155]">
              <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">Usuarios</p>
              <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-[#f6f6f6]">0</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155]">
              <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">Páginas</p>
              <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-[#f6f6f6]">0</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155]">
              <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">Alertas</p>
              <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-[#f6f6f6]">0</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155]">
              <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">Visitas</p>
              <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-[#f6f6f6]">0</p>
            </div>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155]">
          <h2 className="mb-4 text-lg font-semibold text-zinc-950 dark:text-[#f6f6f6]">Actividad Reciente</h2>
          {data?.recentActivity && data.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 dark:border-[#7db828]/30"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-[#1e293b] dark:text-[#cbd5e1]">
                    {activity.user?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-950 dark:text-[#f6f6f6]">
                      {activity.action}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-[#94a3b8]">{activity.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-500 dark:text-[#94a3b8]">{activity.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">No hay actividad reciente.</p>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155]">
          <h2 className="mb-4 text-lg font-semibold text-zinc-950 dark:text-[#f6f6f6]">Alertas</h2>
          {data?.alerts && data.alerts.length > 0 ? (
            <div className="space-y-3">
              {data.alerts.map((alert) => {
                const alertClasses =
                  alert.type === 'warning'
                    ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                    : alert.type === 'danger'
                      ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                      : alert.type === 'success'
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                        : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
                return (
                  <div key={alert.id} className={`rounded-lg border p-3 ${alertClasses}`}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="mt-0.5 text-xs opacity-80">{alert.message}</p>
                    </div>
                    <span className="shrink-0 text-xs opacity-60">{alert.date}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">No hay alertas activas.</p>
          )}
        </div>
      </div>
    </div>
  );
}

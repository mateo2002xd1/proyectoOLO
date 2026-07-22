'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/shared/ui/atoms/avatar';
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
  SidebarHeading,
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
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/16/solid';
import {
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  HomeIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  Square2StackIcon,
  TicketIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/20/solid';

type PanelData = {
  stats: Record<string, number>;
  alerts: { id: string; title: string; type: string; message: string; date: string }[];
  recentActivity: { id: string; action: string; user: string; date: string; description: string }[];
};

export function PanelGeneralLayout({ children, userProfile }: { children: React.ReactNode; userProfile?: { name: string; email: string } }) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const isDarkNow = !isDark;
    setIsDark(isDarkNow);
    if (isDarkNow) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('olo-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('olo-theme', 'light');
    }
  };

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }, [router]);

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSection>
            <NavbarItem href="/dashboard/buscar" aria-label="Buscar">
              <MagnifyingGlassIcon />
            </NavbarItem>
            <NavbarItem href="/dashboard/inbox" aria-label="Bandeja de entrada">
              <InboxIcon />
            </NavbarItem>
            <button onClick={toggleTheme} className="p-2 ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white" aria-label="Cambiar tema">
              {isDark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
            </button>
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection>
            <Dropdown>
              <DropdownMenu className="min-w-64" anchor="bottom end">
                <DropdownItem href="/dashboard/mi-perfil">
                  <UserIcon />
                  <DropdownLabel>Mi perfil</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/dashboard/configuracion">
                  <Cog8ToothIcon />
                  <DropdownLabel>Configuración</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="/dashboard/privacidad">
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
              <img src="/asset/logos/olo-logo-horizontal.svg" className='h-13' />
              <button onClick={toggleTheme} className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white" aria-label="Cambiar tema">
                {isDark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
              </button>
            </div>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/dashboard">
                <HomeIcon />
                <SidebarLabel>Dashboard</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/users">
                <UserIcon />
                <SidebarLabel>Usuarios</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/revision">
                <ClipboardDocumentCheckIcon />
                <SidebarLabel>Páginas en revisión</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/dashboard/auditoria">
                <ShieldCheckIcon />
                <SidebarLabel>Auditoría</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
            <SidebarSpacer />
            <SidebarSection>
              <SidebarItem href="/dashboard/soporte">
                <QuestionMarkCircleIcon />
                <SidebarLabel>Soporte</SidebarLabel>
              </SidebarItem>
              </SidebarSection>
          </SidebarBody>

          <SidebarSection className="max-lg:hidden mx-2 mb">
            <SidebarItem href="/dashboard/buscar">
              <MagnifyingGlassIcon />
              <SidebarLabel>Buscar</SidebarLabel>
            </SidebarItem>
            <SidebarItem href="/dashboard/inbox">
              <InboxIcon />
              <SidebarLabel>Bandeja de entrada</SidebarLabel>
            </SidebarItem>
          </SidebarSection>

          <SidebarFooter className="max-lg:hidden">
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <span className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="min-w-0">
                    <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                      {userProfile?.name || 'Usuario'}
                    </span>
                    <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                      {userProfile?.email || 'cargando...'}
                    </span>
                  </span>
                </span>
                <ChevronUpIcon />
              </DropdownButton>
              <DropdownMenu className="min-w-64" anchor="top start">
                <DropdownItem href="/dashboard/mi-perfil">
                  <UserIcon />
                  <DropdownLabel>Mi perfil</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/dashboard/configuracion">
                  <Cog8ToothIcon />
                  <DropdownLabel>Configuración</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="/dashboard/privacidad">
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
  );
}

export function PanelGeneralDashboard() {
  const [data, setData] = useState<PanelData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Simular carga de datos para evitar el 404 del endpoint de páginas públicas
      await new Promise(resolve => setTimeout(resolve, 500));
      setData({ stats: { usuarios: 0, paginas: 0, alertas: 0, visitas: 0 }, alerts: [], recentActivity: [] });
    } catch {
      setData({ stats: { usuarios: 0, paginas: 0, alertas: 0, visitas: 0 }, alerts: [], recentActivity: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-950">
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
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Resumen de tareas pendientes y gestión del observatorio.
          </p>
        </div>

        {/* Action Buttons for Editors */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <a
            href="/contenido/inicio/editor"
            className="group flex flex-col justify-center gap-1 rounded-xl border border-zinc-200 bg-white p-5 transition-all duration-200 ease-out hover:translate-x-1 hover:border-[#7DB829]/40 hover:bg-[#7DB829]/10 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-[#7DB829]/40 dark:hover:bg-[#7DB829]/10"
          >
            <h3 className="font-semibold text-zinc-950 group-hover:text-[#4C7A1C] dark:text-white dark:group-hover:text-[#9ED65C]">
              Editar Sitio Web
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Abre el editor visual Puck para el sitio público principal
            </p>
          </a>

          {/* TODO(intranet): confirmar si intranet adopta el mismo esquema de rutas sin prefijo /admin */}
          <a
            href="http://localhost:3001/admin/editor/inicio"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-center gap-1 rounded-xl border border-zinc-200 bg-white p-5 transition-all duration-200 ease-out hover:translate-x-1 hover:border-[#011A39]/40 hover:bg-[#011A39]/10 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-[#011A39]/40 dark:hover:bg-[#011A39]/20"
          >
            <h3 className="font-semibold text-zinc-950 group-hover:text-[#011A39] dark:text-white dark:group-hover:text-[#8FA8C9]">
              Editar Intranet
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Abre el editor visual Puck para el sistema de Intranet
            </p>
          </a>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsEntries.length > 0 ? (
            statsEntries.map(([key, value]) => (
              <div key={key} className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{statsLabels[key] || key}</p>
                <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">{value}</p>
              </div>
            ))
          ) : (
            <>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Usuarios</p>
                <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">0</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Páginas</p>
                <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">0</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Alertas</p>
                <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">0</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Visitas</p>
                <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">0</p>
              </div>
            </>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600">
            <h2 className="mb-4 text-lg font-semibold text-zinc-950 dark:text-white">Actividad Reciente</h2>
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {data.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      {activity.user?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-950 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{activity.description}</p>
                    </div>
                    <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">{activity.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No hay actividad reciente.</p>
            )}
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600">
            <h2 className="mb-4 text-lg font-semibold text-zinc-950 dark:text-white">Alertas</h2>
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
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No hay alertas activas.</p>
            )}
          </div>
        </div>
      </div>
  );
}

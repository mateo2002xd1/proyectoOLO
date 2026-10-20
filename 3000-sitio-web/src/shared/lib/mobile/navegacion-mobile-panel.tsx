'use client';

import { usePathname } from 'next/navigation';
import { Cog8ToothIcon, ShieldCheckIcon } from '@heroicons/react/16/solid';
import {
  ArchiveBoxIcon,
  ClipboardDocumentCheckIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/20/solid';
import { IconoActualizaciones } from '@/shared/ui/atoms/icono-actualizaciones';
import { IconoAccesos } from '@/shared/ui/atoms/icono-accesos';
import { NavegacionMobile, type DestinoMobile } from './navegacion-mobile';

/** Las secciones que van dentro de «Más»: si se está en una, «Más» sale marcado. */
const RUTAS_DE_MAS = ['/admin-panel/update-section', '/admin-panel/backup-section', '/admin-panel/configuration'];

interface NavegacionMobilePanelProps {
  /** Páginas esperando aprobación: el globo de «Revisión». */
  pendientesRevision: number;
  /** El icono del centro: el de Configuración → Identidad visual, o el de fábrica. */
  logo: string;
  logoEnBlancoEnOscuro: boolean;
}

/**
 * Las secciones del panel en el móvil, las mismas de la barra lateral, que por debajo
 * de `lg` no se ve. Las que más se usan van a la vista y el resto en «Más»; el logo
 * del centro lleva al Dashboard. La cuenta y los avisos no van aquí: están arriba, en
 * la barra superior del móvil (`panel-general.tsx`).
 */
export function NavegacionMobilePanel({ pendientesRevision, logo, logoEnBlancoEnOscuro }: NavegacionMobilePanelProps) {
  const pathname = usePathname();
  const enMas = RUTAS_DE_MAS.some((ruta) => pathname.startsWith(ruta));

  const destinos: DestinoMobile[] = [
    {
      clave: 'accesos',
      etiqueta: 'Accesos',
      icono: <IconoAccesos />,
      activo: pathname.startsWith('/admin-panel/users') || pathname.startsWith('/admin-panel/roles-and-permissions'),
      hijos: [
        { clave: 'usuarios', etiqueta: 'Usuarios', href: '/admin-panel/users', activo: pathname.startsWith('/admin-panel/users') },
        { clave: 'roles', etiqueta: 'Roles y Permisos', href: '/admin-panel/roles-and-permissions', activo: pathname.startsWith('/admin-panel/roles-and-permissions') },
      ],
    },
    {
      clave: 'revision',
      etiqueta: 'Revisión',
      icono: <ClipboardDocumentCheckIcon />,
      href: '/admin-panel/review-section',
      activo: pathname.startsWith('/admin-panel/review-section'),
      contador: pendientesRevision,
    },
    {
      clave: 'auditoria',
      etiqueta: 'Auditoría',
      icono: <ShieldCheckIcon />,
      href: '/admin-panel/changelog-view',
      activo: pathname.startsWith('/admin-panel/changelog-view'),
    },
    {
      clave: 'mas',
      etiqueta: 'Más',
      icono: <EllipsisHorizontalIcon />,
      activo: enMas,
      hijos: [
        { clave: 'actualizaciones', etiqueta: 'Actualizaciones', icono: <IconoActualizaciones />, href: '/admin-panel/update-section', activo: pathname.startsWith('/admin-panel/update-section') },
        { clave: 'respaldos', etiqueta: 'Respaldos', icono: <ArchiveBoxIcon />, href: '/admin-panel/backup-section', activo: pathname.startsWith('/admin-panel/backup-section') },
        { clave: 'configuracion', etiqueta: 'Configuración', icono: <Cog8ToothIcon />, href: '/admin-panel/configuration', activo: pathname.startsWith('/admin-panel/configuration') },
      ],
    },
  ];

  return (
    <NavegacionMobile
      etiqueta="Secciones del panel"
      destinos={destinos}
      inicio={{
        href: '/admin-panel/dashboard',
        etiqueta: 'Dashboard',
        logo,
        logoEnBlancoEnOscuro,
        activo: pathname.startsWith('/admin-panel/dashboard') && !enMas,
      }}
    />
  );
}

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
const RUTAS_DE_MAS = ['/admin/actualizaciones', '/admin/respaldos', '/admin/configuracion'];

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
      activo: pathname.startsWith('/admin/users') || pathname.startsWith('/admin/roles'),
      hijos: [
        { clave: 'usuarios', etiqueta: 'Usuarios', href: '/admin/users', activo: pathname.startsWith('/admin/users') },
        { clave: 'roles', etiqueta: 'Roles y Permisos', href: '/admin/roles', activo: pathname.startsWith('/admin/roles') },
      ],
    },
    {
      clave: 'revision',
      etiqueta: 'Revisión',
      icono: <ClipboardDocumentCheckIcon />,
      href: '/admin/revision',
      activo: pathname.startsWith('/admin/revision'),
      contador: pendientesRevision,
    },
    {
      clave: 'auditoria',
      etiqueta: 'Auditoría',
      icono: <ShieldCheckIcon />,
      href: '/admin/auditoria',
      activo: pathname.startsWith('/admin/auditoria'),
    },
    {
      clave: 'mas',
      etiqueta: 'Más',
      icono: <EllipsisHorizontalIcon />,
      activo: enMas,
      hijos: [
        { clave: 'actualizaciones', etiqueta: 'Actualizaciones', icono: <IconoActualizaciones />, href: '/admin/actualizaciones', activo: pathname.startsWith('/admin/actualizaciones') },
        { clave: 'respaldos', etiqueta: 'Respaldos', icono: <ArchiveBoxIcon />, href: '/admin/respaldos', activo: pathname.startsWith('/admin/respaldos') },
        { clave: 'configuracion', etiqueta: 'Configuración', icono: <Cog8ToothIcon />, href: '/admin/configuracion', activo: pathname.startsWith('/admin/configuracion') },
      ],
    },
  ];

  return (
    <NavegacionMobile
      etiqueta="Secciones del panel"
      destinos={destinos}
      inicio={{
        href: '/admin/dashboard',
        etiqueta: 'Dashboard',
        logo,
        logoEnBlancoEnOscuro,
        activo: pathname.startsWith('/admin/dashboard') && !enMas,
      }}
    />
  );
}

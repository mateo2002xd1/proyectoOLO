'use client';

import { useSyncExternalStore } from 'react';

interface EditButtonProps {
  slug: string;
}

const EDITABLE_ROLES = ['Superadmin', 'Administrador', 'Editor'];

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/* La cookie es un sistema externo a React: la leemos con useSyncExternalStore
   en vez de copiarla a un useState desde un efecto. No hay evento nativo de
   cambio de cookie, así que la suscripción no re-consulta; basta con leerla
   en cada render, que es cuando React pide el snapshot. */
function subscribeToCookies() {
  return () => {};
}

/** 'role' es no-httpOnly → legible por JS (el token sí es httpOnly, no accesible aquí). */
const getSessionSnapshot = () => EDITABLE_ROLES.includes(getCookie('role') ?? '');
/** En el servidor no hay document; asumimos sin sesión para que el HTML inicial coincida. */
const getSessionServerSnapshot = () => false;

export default function EditButton({ slug }: EditButtonProps) {
  const hasSession = useSyncExternalStore(
    subscribeToCookies,
    getSessionSnapshot,
    getSessionServerSnapshot,
  );

  if (!hasSession) return null;

  const href = `/admin/editor/${slug}`;
  const title = 'Editar esta página';
  const label = 'Editar';

  return (
    <a
      href={href}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#0943B5] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#072d8a]"
      title={title}
      aria-label={title}
    >
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 25 23"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.474 3.607L21.389 7.522a.5.5 0 0 1 0 .707L11.91 17.6l-4.028.447a.5.5 0 0 1-.552-.552l.447-4.028L16.875 3.607a.5.5 0 0 1 .6 0ZM24.505 2.613L22.387.494a2.083 2.083 0 0 0-2.396 0L18.455 2.03a.5.5 0 0 0 0 .708l3.915 3.915a.5.5 0 0 0 .707 0l1.429-1.429a2.083 2.083 0 0 0 0-2.61ZM16.667 15.022V19.44H2.778V5.551h9.974a.5.5 0 0 0 .355-.148l1.736-1.736c.33-.33.096-.89-.442-.89H2.083A2.083 2.083 0 0 0 0 4.857v15.277c0 1.15.933 2.083 2.083 2.083h15.278c1.15 0 2.083-.933 2.083-2.083v-6.849c0-.464-.56-.694-.889-.364l-1.736 1.736a.5.5 0 0 0-.152.365Z"
          fill="currentColor"
        />
      </svg>
      <span>{label}</span>
    </a>
  );
}

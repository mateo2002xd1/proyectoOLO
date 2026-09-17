'use client';

import { useMemo } from 'react';
import type { User } from '../hooks/use-usuarios';

interface Props {
  users: User[];
  loading?: boolean;
}

const COLORES = [
  '#4C7A1C', // Verde OLO
  '#0284c7', // Azul Intranet
  '#f59e0b', // Naranja
  '#8b5cf6', // Violeta
  '#ec4899', // Rosa
  '#0d9488', // Teal
  '#64748b', // Gris
];

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

export function TarjetaUsuarios({ users, loading }: Props) {
  const totalUsuarios = users.length;
  const usuariosPorRol = useMemo(() => contarUsuariosPorRol(users), [users]);

  // Construir el conic-gradient de forma compatible (sin double-position color stops)
  const gradientStops = useMemo(() => {
    if (totalUsuarios === 0) return 'transparent 0% 100%';
    let currentPercent = 0;
    return usuariosPorRol.map((item, index) => {
      const percentage = (item.total / totalUsuarios) * 100;
      const color = COLORES[index % COLORES.length];
      const start = currentPercent;
      const end = currentPercent + percentage;
      currentPercent = end;
      return `${color} ${start}%, ${color} ${end}%`;
    }).join(', ');
  }, [usuariosPorRol, totalUsuarios]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 ease-out hover:translate-x-1 hover:border-zinc-300 hover:shadow-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:hover:border-[#334155] flex flex-col h-full">
      <div className="flex items-start justify-between gap-2 shrink-0">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-[#94a3b8]">Usuarios</p>
          {loading ? (
            <p className="mt-1 text-2xl font-bold text-zinc-400 dark:text-zinc-600">—</p>
          ) : (
            <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-[#f6f6f6] tabular-nums">
              {totalUsuarios}
            </p>
          )}
        </div>
      </div>

      {!loading && usuariosPorRol.length > 0 && (
        <div className="mt-3 border-t border-zinc-100 pt-5 dark:border-[#7db828]/20 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-6">
            {/* Gráfico de Torta (Donut) */}
            <div className="relative size-32 shrink-0">
              <div 
                className="absolute inset-0 rounded-full transition-all duration-500 ease-out"
                style={{ background: `conic-gradient(${gradientStops})` }}
              />
              <div className="absolute inset-4 rounded-full bg-white dark:bg-[#131b2f]" />
            </div>

            {/* Leyenda */}
            <div className="flex-1 space-y-2.5">
              {usuariosPorRol.map((item, index) => {
                const color = COLORES[index % COLORES.length];
                return (
                  <div key={item.rol} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                      <span className="truncate font-medium text-zinc-600 dark:text-zinc-300">{item.rol}</span>
                    </div>
                    <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
                      {item.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

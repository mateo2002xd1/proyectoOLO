'use client';

import { requisitosDe } from '@olo/password-policy';

/**
 * Lista de requisitos de contraseña (§1 de las directivas), marcando cuáles cumple
 * ya lo que se lleva tecleado.
 *
 * Se pinta entera desde el campo vacío en vez de ir soltando errores al enviar: son
 * cuatro reglas, y descubrirlas de una en una a base de rechazos es la forma más
 * rápida de que alguien abandone en el primer intento.
 *
 * Sigue el patrón `classPrefix` del resto de moléculas de auth (`rp-`, `fl-`…) para
 * heredar el mismo aspecto que el formulario donde se inserta.
 *
 * `resumirAlCumplir`: cumplidos todos, la lista se queda en una sola línea («Cumple todos
 * los requisitos»), para que el formulario quepa sin scroll en el móvil (2026-10-10). Mientras
 * falte alguno se ve entera, por lo dicho arriba. Igual que en el acceso del sitio web.
 */
export function PasswordRequisitos({
  classPrefix,
  password,
  className = 'mb-4',
  variant,
  resumirAlCumplir = false,
}: {
  classPrefix?: string;
  password: string;
  className?: string;
  variant?: 'panel' | 'solid';
  resumirAlCumplir?: boolean;
}) {
  const todos = requisitosDe(password);
  const requisitos =
    resumirAlCumplir && todos.every((r) => r.cumplido)
      ? [{ id: 'todos', etiqueta: 'Cumple todos los requisitos', cumplido: true }]
      : todos;
  const esSolido = variant === 'solid';

  if (esSolido) {
    return (
      <ul className={`${className} space-y-1`} aria-live="polite">
        {requisitos.map((requisito) => {
          // Claros: van sobre el azul del acceso, sin tarjeta. Ver
          // `features/login/components/acceso-ui.ts`.
          const claseEstado = requisito.cumplido
            ? 'text-green-300'
            : 'text-white/70';

          return (
            <li key={requisito.id} className={`flex items-start gap-1.5 text-xs ${claseEstado}`}>
              <span aria-hidden="true" className="mt-px leading-none">
                {requisito.cumplido ? '✓' : '○'}
              </span>
              <span className="sr-only">{requisito.cumplido ? 'Cumplido:' : 'Pendiente:'}</span>
              <span>{requisito.etiqueta}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  const prefix = classPrefix || 'rp';

  return (
    // `aria-live` para que un lector de pantalla anuncie los que se van cumpliendo;
    // sin eso la lista es información puramente visual.
    <ul className={`${prefix}-requisitos`} aria-live="polite">
      {requisitos.map((requisito) => (
        <li
          key={requisito.id}
          className={`${prefix}-requisito ${
            requisito.cumplido ? `${prefix}-requisito-ok` : ''
          }`}
        >
          <span aria-hidden="true">{requisito.cumplido ? '✓' : '○'}</span>
          {/* El estado va también en texto: el color y el símbolo solos no lo dicen. */}
          <span className="sr-only">{requisito.cumplido ? 'Cumplido:' : 'Pendiente:'}</span>
          <span>{requisito.etiqueta}</span>
        </li>
      ))}
    </ul>
  );
}

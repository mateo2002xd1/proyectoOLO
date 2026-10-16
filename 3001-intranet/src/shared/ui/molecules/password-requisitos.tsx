'use client';

import { requisitosDe } from '@olo/password-policy';
import { IconoError, IconoExito, MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';

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
  enBlanco = false,
  rechazo,
}: {
  classPrefix?: string;
  password: string;
  className?: string;
  variant?: 'panel' | 'solid';
  resumirAlCumplir?: boolean;
  /** Desde `md`, en oscuro para la tarjeta blanca de la recuperación (2026-10-12). */
  enBlanco?: boolean;
  /**
   * Por qué se rechazó una contraseña que cumple todos los requisitos («Esta contraseña no
   * es válida por seguridad, elige otra.»): ocupa el sitio de «Cumple todos los requisitos»
   * como mensaje de error, en rojo (pedido del usuario, 2026-10-15). Los dos a la vez se
   * contradecían. El campo deja solo su borde rojo (`textoDeErrorAparte`).
   */
  rechazo?: string;
}) {
  const todos = requisitosDe(password);
  const resumida = resumirAlCumplir && todos.every((r) => r.cumplido);
  const requisitos = resumida
    ? [{ id: 'todos', etiqueta: 'Cumple todos los requisitos', cumplido: true }]
    : todos;
  const esSolido = variant === 'solid';

  if (esSolido) {
    // El `aria-live` va en un contenedor que no cambia: si fuera la propia lista, al resumirla
    // se desmontaría y el lector de pantalla podría no anunciar el mensaje que la reemplaza.
    return (
      <div className={className} aria-live="polite">
        {resumida ? (
          // Cumplidos todos, el mensaje de éxito del proyecto, con su globo y su ✓ (pedido del
          // usuario, 2026-10-15), como en el sitio web. Antes, una línea verde con «✓».
          rechazo ? (
            <MensajeEstado tipo="error" rol="alert">{rechazo}</MensajeEstado>
          ) : (
            <MensajeEstado tipo="exito" rol="note">Cumple todos los requisitos</MensajeEstado>
          )
        ) : (
          <ul className="space-y-1">
            {todos.map((requisito) => {
              // Claros: van sobre el azul del acceso, sin tarjeta. Ver
              // `features/login/components/acceso-ui.ts`.
              // `enBlanco`: verde 700 (5:1) y `#334861` (9:1) sobre el blanco, desde `md`.
              const claseEstado = requisito.cumplido
                ? `text-green-300 ${enBlanco ? 'md:text-green-700' : ''}`
                : `text-white/70 ${enBlanco ? 'md:text-[#334861]' : ''}`;

              return (
                <li key={requisito.id} className={`flex items-start gap-1.5 text-xs ${claseEstado}`}>
                  {/* Los iconos de los mensajes de estado, sin su fondo (pedido del usuario, 2026-10-15):
                      el globo con ✓ y el círculo con ×. Toman el color del texto (`currentColor`). */}
                  {requisito.cumplido ? (
                    <IconoExito className="mt-px h-3.5 w-[13px] shrink-0" />
                  ) : (
                    <IconoError className="mt-px h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="sr-only">{requisito.cumplido ? 'Cumplido:' : 'Pendiente:'}</span>
                  <span>{requisito.etiqueta}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
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

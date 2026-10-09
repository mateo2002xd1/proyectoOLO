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
 */
export function PasswordRequisitos({
  classPrefix,
  password,
  className = 'mb-4',
  variant,
}: {
  classPrefix?: string;
  password: string;
  className?: string;
  variant?: 'panel' | 'solid';
}) {
  const requisitos = requisitosDe(password);
  const esSolido = variant === 'solid';

  if (esSolido) {
    return (
      <ul className={`${className} space-y-1`} aria-live="polite">
        {requisitos.map((requisito) => {
          const claseEstado = requisito.cumplido
            ? 'text-green-700'
            : 'text-gray-500';

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

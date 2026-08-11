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
}: {
  classPrefix: string;
  password: string;
}) {
  const requisitos = requisitosDe(password);

  return (
    // `aria-live` para que un lector de pantalla anuncie los que se van cumpliendo;
    // sin eso la lista es información puramente visual.
    <ul className={`${classPrefix}-requisitos`} aria-live="polite">
      {requisitos.map((requisito) => (
        <li
          key={requisito.id}
          className={`${classPrefix}-requisito ${
            requisito.cumplido ? `${classPrefix}-requisito-ok` : ''
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

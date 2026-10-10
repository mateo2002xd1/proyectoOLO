"use client";

import { createContext, useContext, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "plain" | "primary" | "danger" | "success" | "navy" | "verde";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  plain?: boolean;
  children: ReactNode;
};

/*
 * Los colores salen de Configuración → Identidad visual: `--olo-boton-{id}-fondo` y `-texto`
 * (`shared/lib/identidad-panel/botones.ts`), que el panel y el editor escriben en `:root`.
 * El segundo valor de cada `var()` es el de fábrica, para donde no se escriben (el acceso,
 * el sitio público): ahí el botón sale como siempre. El paso del puntero se calcula
 * (`color-mix`, 15 % más oscuro, o más claro en los fondos oscuros) para que siga al color
 * elegido. Clases enteras y literales: Tailwind solo genera lo que encuentra escrito.
 */
const variantStyles: Record<ButtonVariant, string> = {
  // Secundario. En modo oscuro se queda transparente con borde: el color elegido es del claro.
  plain:
    "border border-[#d0d5dd] bg-[color:var(--olo-boton-secundario-fondo,#ffffff)] text-[color:var(--olo-boton-secundario-texto,#344054)] hover:bg-[color-mix(in_srgb,var(--olo-boton-secundario-fondo,#ffffff)_96%,black)] dark:border-[#2d3649] dark:bg-transparent dark:text-[#b7c0d6] dark:hover:bg-[#252f47]",
  // Principal. De fábrica `brand-interactive` (#7db828) y no el verde de identidad: blanco
  // encima da 2.42:1 contra el 4.5:1 de AA. Ver 9-accesibilidad.md §2.1.
  primary:
    "bg-[color:var(--olo-boton-principal-fondo,#7db828)] text-[color:var(--olo-boton-principal-texto,#ffffff)] shadow-[0_2px_8px_-2px_rgba(42,125,0,0.4)] hover:bg-[color-mix(in_srgb,var(--olo-boton-principal-fondo,#7db828)_85%,black)] active:scale-95",
  danger:
    "bg-[color:var(--olo-boton-peligro-fondo,#dc2626)] text-[color:var(--olo-boton-peligro-texto,#ffffff)] shadow-[0_2px_8px_-2px_rgba(220,38,38,0.4)] hover:bg-[color-mix(in_srgb,var(--olo-boton-peligro-fondo,#dc2626)_85%,black)] active:scale-95",
  success:
    "bg-[color:var(--olo-boton-principal-fondo,#7db828)] text-[color:var(--olo-boton-principal-texto,#ffffff)] shadow-[0_2px_8px_-2px_rgba(42,125,0,0.4)] hover:bg-[color-mix(in_srgb,var(--olo-boton-principal-fondo,#7db828)_85%,black)] active:scale-95",
  // Azul institucional oscuro (`--color-primary-darkest`). Es la acción principal de la
  // pantalla de acceso, donde el verde competiría con el fondo. Texto blanco encima: 18.2:1.
  navy:
    "bg-[color:var(--olo-boton-azul-oscuro-fondo,#0d1526)] text-[color:var(--olo-boton-azul-oscuro-texto,#ffffff)] shadow-[0_2px_8px_-2px_rgba(13,21,38,0.4)] hover:bg-[color-mix(in_srgb,var(--olo-boton-azul-oscuro-fondo,#0d1526)_85%,white)] active:scale-95",
  // El verde de identidad (#7DB728) tal cual, pedido por el usuario para «Guardar» en los
  // modales de Roles. Ojo: blanco encima da 2.42:1, por debajo del 4.5:1 de AA.
  verde:
    "bg-[color:var(--olo-boton-verde-fondo,#7db728)] text-[color:var(--olo-boton-verde-texto,#ffffff)] shadow-[0_2px_8px_-2px_rgba(42,125,0,0.4)] hover:bg-[color-mix(in_srgb,var(--olo-boton-verde-fondo,#7db728)_85%,black)] active:scale-95",
};

/**
 * Dentro de un modal los botones llevan las medidas de las pantallas de acceso
 * (`auth-ui.tsx`), que el usuario pidió para todos los modales el 2026-10-09: 44 px de
 * alto, esquinas de 32, 16 px de letra y la acción principal en `#001631` (el verde
 * se queda para los botones de las páginas). «Eliminar» sigue en rojo.
 */
const variantStylesDeModal: Record<ButtonVariant, string> = {
  plain:
    "border border-[#d9d9d9] bg-[color:var(--olo-boton-secundario-modal-fondo,#ffffff)] text-[color:var(--olo-boton-secundario-modal-texto,#001631)] hover:bg-[color-mix(in_srgb,var(--olo-boton-secundario-modal-fondo,#ffffff)_96%,black)] dark:border-[#2d3649] dark:bg-transparent dark:text-[#e6e8f0] dark:hover:bg-[#252f47]",
  // La principal de los modales. En modo oscuro se invierte (fondo del color de la letra y
  // letra del color del fondo): de fábrica, blanco con letra azul marino, como hasta ahora.
  primary:
    "bg-[color:var(--olo-boton-principal-modal-fondo,#001631)] text-[color:var(--olo-boton-principal-modal-texto,#ffffff)] hover:bg-[color-mix(in_srgb,var(--olo-boton-principal-modal-fondo,#001631)_85%,white)] dark:bg-[color:var(--olo-boton-principal-modal-texto,#ffffff)] dark:text-[color:var(--olo-boton-principal-modal-fondo,#001631)] dark:hover:bg-[color-mix(in_srgb,var(--olo-boton-principal-modal-texto,#ffffff)_90%,black)]",
  danger:
    "bg-[color:var(--olo-boton-peligro-fondo,#dc2626)] text-[color:var(--olo-boton-peligro-texto,#ffffff)] hover:bg-[color-mix(in_srgb,var(--olo-boton-peligro-fondo,#dc2626)_85%,black)]",
  success:
    "bg-[color:var(--olo-boton-principal-modal-fondo,#001631)] text-[color:var(--olo-boton-principal-modal-texto,#ffffff)] hover:bg-[color-mix(in_srgb,var(--olo-boton-principal-modal-fondo,#001631)_85%,white)] dark:bg-[color:var(--olo-boton-principal-modal-texto,#ffffff)] dark:text-[color:var(--olo-boton-principal-modal-fondo,#001631)] dark:hover:bg-[color-mix(in_srgb,var(--olo-boton-principal-modal-texto,#ffffff)_90%,black)]",
  navy:
    "bg-[color:var(--olo-boton-principal-modal-fondo,#001631)] text-[color:var(--olo-boton-principal-modal-texto,#ffffff)] hover:bg-[color-mix(in_srgb,var(--olo-boton-principal-modal-fondo,#001631)_85%,white)] dark:bg-[color:var(--olo-boton-principal-modal-texto,#ffffff)] dark:text-[color:var(--olo-boton-principal-modal-fondo,#001631)] dark:hover:bg-[color-mix(in_srgb,var(--olo-boton-principal-modal-texto,#ffffff)_90%,black)]",
  // La excepción verde a la acción principal en `#001631`: igual en claro y en oscuro.
  verde:
    "bg-[color:var(--olo-boton-verde-fondo,#7db728)] text-[color:var(--olo-boton-verde-texto,#ffffff)] hover:bg-[color-mix(in_srgb,var(--olo-boton-verde-fondo,#7db728)_85%,black)]",
};

const EnModal = createContext(false);

/**
 * Marca lo que va dentro de un modal: los `Button` de dentro toman las medidas de
 * modal. `Alert` ya lo pone; los modales con caja propia (permisos) lo ponen a mano.
 */
export function FormaDeModal({ children }: { children: ReactNode }) {
  return <EnModal.Provider value={true}>{children}</EnModal.Provider>;
}

/** Si se está dentro de un modal: los campos propios (`CustomSelect`, `DatePicker`) lo usan. */
export const useEnModal = () => useContext(EnModal);

export function Button({
  variant = "primary",
  plain = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const enModal = useContext(EnModal);
  const base = enModal
    ? "inline-flex h-11 items-center justify-center whitespace-nowrap rounded-[32px] px-6 text-base font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#001631] disabled:opacity-50 disabled:cursor-not-allowed dark:focus-visible:ring-white"
    : // El anillo va a opacidad plena: SC 1.4.11 exige 3:1 para el indicador
      // de foco, y un `/40` lo dejaba muy por debajo.
      "inline-flex items-center justify-center rounded-[16px] px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-focus disabled:opacity-50 disabled:cursor-not-allowed";

  const estilos = enModal ? variantStylesDeModal : variantStyles;
  const style = plain ? estilos.plain : estilos[variant];

  return (
    <button className={`${base} ${style} ${className}`} {...props}>
      {children}
    </button>
  );
}

"use client";

import { createContext, useContext, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "plain" | "primary" | "danger" | "success" | "navy";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  plain?: boolean;
  children: ReactNode;
};

const variantStyles: Record<ButtonVariant, string> = {
  plain:
    "border border-[#d0d5dd] bg-white text-[#344054] hover:bg-[#f9fafb] dark:border-[#2d3649] dark:bg-transparent dark:text-[#b7c0d6] dark:hover:bg-[#252f47]",
  // `brand-interactive` y no `brand`: estas variantes llevan texto blanco
  // encima, y el verde de identidad da 2.42:1 contra el 4.5:1 que exige el
  // nivel AA. Ver 9-accesibilidad.md §2.1.
  primary:
    "bg-brand-interactive text-white shadow-[0_2px_8px_-2px_rgba(42,125,0,0.4)] hover:bg-brand-interactive-hover active:scale-95",
  danger:
    "bg-[#dc2626] text-white shadow-[0_2px_8px_-2px_rgba(220,38,38,0.4)] hover:bg-[#b91c1c] active:scale-95",
  success:
    "bg-brand-interactive text-white shadow-[0_2px_8px_-2px_rgba(42,125,0,0.4)] hover:bg-brand-interactive-hover active:scale-95",
  // Azul institucional oscuro (`--color-primary-darkest`, con `--color-primary-dark`
  // al pasar por encima). Es la acción principal de la pantalla de acceso, donde el
  // verde competiría con el fondo. Texto blanco encima: 18.2:1, muy por encima del
  // 4.5:1 de AA. Va en hex porque estos dos tokens viven en `:root` y no en
  // `@theme`, así que Tailwind no genera utilidad para ellos.
  navy:
    "bg-[#0d1526] text-white shadow-[0_2px_8px_-2px_rgba(13,21,38,0.4)] hover:bg-[#1a2340] active:scale-95",
};

/**
 * Dentro de un modal los botones llevan las medidas de las pantallas de acceso
 * (`auth-ui.tsx`), que el usuario pidió para todos los modales el 2026-10-09: 44 px de
 * alto, esquinas de 32, 16 px de letra y la acción principal en `#001631` (el verde
 * se queda para los botones de las páginas). «Eliminar» sigue en rojo.
 */
const variantStylesDeModal: Record<ButtonVariant, string> = {
  plain:
    "border border-[#d9d9d9] bg-white text-[#001631] hover:bg-[#f5f7fa] dark:border-[#2d3649] dark:bg-transparent dark:text-[#e6e8f0] dark:hover:bg-[#252f47]",
  primary:
    "bg-[#001631] text-white hover:bg-[#002a5c] dark:bg-white dark:text-[#001631] dark:hover:bg-[#e6e8f0]",
  danger: "bg-[#dc2626] text-white hover:bg-[#b91c1c]",
  success:
    "bg-[#001631] text-white hover:bg-[#002a5c] dark:bg-white dark:text-[#001631] dark:hover:bg-[#e6e8f0]",
  navy: "bg-[#001631] text-white hover:bg-[#002a5c] dark:bg-white dark:text-[#001631] dark:hover:bg-[#e6e8f0]",
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

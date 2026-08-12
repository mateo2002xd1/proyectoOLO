"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

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

export function Button({
  variant = "primary",
  plain = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    // El anillo va a opacidad plena: SC 1.4.11 exige 3:1 para el indicador
    // de foco, y un `/40` lo dejaba muy por debajo.
    "inline-flex items-center justify-center rounded-[16px] px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-focus disabled:opacity-50 disabled:cursor-not-allowed";

  const style = plain ? variantStyles.plain : variantStyles[variant];

  return (
    <button className={`${base} ${style} ${className}`} {...props}>
      {children}
    </button>
  );
}

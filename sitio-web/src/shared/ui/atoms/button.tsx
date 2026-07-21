"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "plain" | "primary" | "danger" | "success";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  plain?: boolean;
  children: ReactNode;
};

const variantStyles: Record<ButtonVariant, string> = {
  plain:
    "border border-[#d0d5dd] bg-white text-[#344054] hover:bg-[#f9fafb] dark:border-[#2d3649] dark:bg-transparent dark:text-[#b7c0d6] dark:hover:bg-[#252f47]",
  primary:
    "bg-[#7eb828] text-white shadow-[0_2px_8px_-2px_rgba(126,184,40,0.4)] hover:bg-[#6ea124] active:scale-95",
  danger:
    "bg-[#dc2626] text-white shadow-[0_2px_8px_-2px_rgba(220,38,38,0.4)] hover:bg-[#b91c1c] active:scale-95",
  success:
    "bg-[#7DB728] text-white shadow-[0_2px_8px_-2px_rgba(125,183,40,0.4)] hover:bg-[#6ba822] active:scale-95",
};

export function Button({
  variant = "primary",
  plain = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39A900]/40 disabled:opacity-50 disabled:cursor-not-allowed";

  const style = plain ? variantStyles.plain : variantStyles[variant];

  return (
    <button className={`${base} ${style} ${className}`} {...props}>
      {children}
    </button>
  );
}

"use client";

import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type AlertProps = {
  open: boolean;
  onClose: (value: boolean) => void;
  children: ReactNode;
  /** Ancho máximo del cuadro (clase de Tailwind); por defecto . */
  anchoMaximo?: string;
};

export function Alert({ open, onClose, children, anchoMaximo = "max-w-md" }: AlertProps) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    // En el móvil el cuadro sale desde abajo, al alcance del pulgar; desde `sm`,
    // centrado. Si es más alto que la pantalla (el formulario de Nuevo Usuario en
    // un teléfono), el fondo hace scroll: el cuadro no puede hacerlo él mismo porque
    // es `overflow-visible` para que las listas desplegables salgan por fuera. Las
    // variantes `-safe` lo alinean arriba cuando no cabe; sin ellas, la parte de
    // arriba del formulario quedaba fuera de la pantalla y fuera del scroll.
    <div
      className="fixed inset-0 z-50 flex items-end-safe justify-center overflow-y-auto bg-[#0f172a]/40 p-4 backdrop-blur-sm sm:items-center-safe"
      // Usamos `onMouseDown` y no `onClick`: si el usuario selecciona texto dentro
      // del cuadro y suelta el ratón fuera, el clic se contabiliza en el fondo y
      // el cuadro se cerraba en mitad de la selección.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose(false);
      }}
    >
      <div
        className={`w-full ${anchoMaximo} rounded-3xl bg-white shadow-[0_24px_48px_-20px_rgba(0,0,0,0.15)] dark:bg-[#1e2538] overflow-visible`}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="px-6 py-6 sm:px-8 sm:py-7 overflow-visible">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function AlertTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="m-0 text-base font-bold text-[#1f2340] dark:text-[#e6e8f0]">
      {children}
    </h2>
  );
}

export function AlertDescription({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 text-sm text-[#667085] dark:text-[#95a0b8]">
      {children}
    </div>
  );
}

export function AlertActions({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex items-center justify-end gap-3">
      {children}
    </div>
  );
}

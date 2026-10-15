"use client";

import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { FormaDeModal } from "@/shared/ui/atoms/button";
import { useCierreAnimado, useUltimoValorAbierto } from "@/shared/lib/use-cierre-animado";

/**
 * Las medidas de los modales son las de las pantallas de acceso (`auth-ui.tsx`), que el
 * usuario pidió para todos los modales del panel y del editor el 2026-10-09: caja con
 * esquinas de 32, título de 20 px, texto de 16, campos y botones de 44 px de alto con
 * esquinas de 32 (los botones las toman de `FormaDeModal`). Lo que puede ocupar varias
 * líneas (un área de texto) lleva 16, como los mensajes de estado.
 *
 * Ojo: en este sitio `rounded-xl` mide 16 px y `rounded-2xl` 24 (globals.css redefine la
 * escala), por eso los 32 van con valor explícito.
 */
const campoComun =
  "w-full border bg-white px-5 text-base text-[#001a39] placeholder:text-[#b3b3b3] transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 dark:bg-[#131b2f] dark:text-[#f6f6f6] dark:placeholder:text-[#64748b] dark:disabled:bg-[#1a2333] dark:disabled:text-[#94a3b8]";

const campoBase = `${campoComun} border-[#d9d9d9] focus:border-[#001631] focus:ring-[#001631] dark:border-[#2d3649] dark:focus:border-white dark:focus:ring-white`;

/**
 * El mismo campo cuando falta su dato o no es válido: borde y resalte en el rojo de los
 * mensajes de error (`MensajeEstado`). Es otra clase entera y no un `border-red` añadido
 * detrás: con dos colores de borde en la misma lista, gana el que Tailwind escriba
 * después en su hoja, no el último de la lista.
 */
const campoBaseConError = `${campoComun} border-[#d90000] focus:border-[#d90000] focus:ring-[#d90000] dark:border-[#ff6b6b] dark:focus:border-[#ff6b6b] dark:focus:ring-[#ff6b6b]`;

/** Campo de una línea dentro de un modal. */
export const campoDeModalClass = `h-11 rounded-[32px] ${campoBase}`;

/** Campo de una línea dentro de un modal, con error (ver `ErrorDeCampo`). */
export const campoDeModalConErrorClass = `h-11 rounded-[32px] ${campoBaseConError}`;

/** Área de texto dentro de un modal: crece hacia abajo, así que esquinas de 16. */
export const areaDeModalClass = `min-h-24 rounded-xl py-3 ${campoBase}`;

/** Área de texto dentro de un modal, con error. */
export const areaDeModalConErrorClass = `min-h-24 rounded-xl py-3 ${campoBaseConError}`;

/**
 * El aviso en letra pequeña bajo un campo al que le falta su dato o lo tiene mal
 * («Falta el nombre.»). El campo lleva `aria-invalid` y `aria-describedby` con este `id`,
 * para que el lector de pantalla lo lea al llegar al campo.
 */
export function ErrorDeCampo({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-xs text-[#d90000] dark:text-[#ff6b6b]">
      {children}
    </p>
  );
}

/** Etiqueta de un campo dentro de un modal (16 px, Medium, como en el acceso). */
export const etiquetaDeModalClass =
  "mb-2 block text-base font-medium text-[#001a39] dark:text-[#cbd5e1]";

type AlertProps = {
  open: boolean;
  onClose: (value: boolean) => void;
  children: ReactNode;
  /** Ancho máximo del cuadro (clase de Tailwind); por defecto `max-w-md`. */
  anchoMaximo?: string;
};

export function Alert({ open, onClose, children, anchoMaximo = "max-w-md" }: AlertProps) {
  const { montado, cerrando } = useCierreAnimado(open);

  // Mientras se va, lo último que tuvo abierto: casi todos los que lo usan cierran
  // vaciando lo que cita el texto (`aEliminar` vuelve a `null`).
  const contenido = useUltimoValorAbierto(open, children);

  if (!montado || typeof document === "undefined") return null;

  return createPortal(
    // En el móvil el cuadro sale desde abajo, al alcance del pulgar; desde `sm`,
    // centrado. Si es más alto que la pantalla (el formulario de Nuevo Usuario en
    // un teléfono), el fondo hace scroll: el cuadro no puede hacerlo él mismo porque
    // es `overflow-visible` para que las listas desplegables salgan por fuera. Las
    // variantes `-safe` lo alinean arriba cuando no cabe; sin ellas, la parte de
    // arriba del formulario quedaba fuera de la pantalla y fuera del scroll.
    <div
      className="olo-anim-fondo fixed inset-0 z-50 flex items-end-safe justify-center overflow-y-auto bg-[#0f172a]/40 p-4 backdrop-blur-sm sm:items-center-safe"
      data-cerrando={cerrando || undefined}
      // Usamos `onMouseDown` y no `onClick`: si el usuario selecciona texto dentro
      // del cuadro y suelta el ratón fuera, el clic se contabiliza en el fondo y
      // el cuadro se cerraba en mitad de la selección.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose(false);
      }}
    >
      <div
        className={`olo-anim-caja w-full ${anchoMaximo} rounded-[32px] bg-white shadow-[0_24px_48px_-20px_rgba(0,0,0,0.15)] dark:bg-[#1e2538] overflow-visible`}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="px-6 py-6 sm:px-8 sm:py-8 overflow-visible">
          <FormaDeModal>{contenido}</FormaDeModal>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function AlertTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="m-0 text-xl font-semibold text-[#001631] dark:text-[#e6e8f0]">
      {children}
    </h2>
  );
}

export function AlertDescription({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 text-base text-[#4b5563] dark:text-[#95a0b8]">
      {children}
    </div>
  );
}

export function AlertActions({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
      {children}
    </div>
  );
}

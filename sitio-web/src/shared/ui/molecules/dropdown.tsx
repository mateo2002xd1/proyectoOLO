'use client';

import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from 'react';
import Link from 'next/link';

interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

function useDropdown() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('Use within Dropdown');
  return ctx;
}

interface DropdownProps {
  children: ReactNode;
  className?: string;
}

export function Dropdown({ children, className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isOpen &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, anchorRef }}>
      <div className={`relative ${className}`}>{children}</div>
    </DropdownContext.Provider>
  );
}

interface DropdownButtonProps {
  as?: React.ElementType;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function DropdownButton({
  as: Component = 'button',
  children,
  className = '',
  onClick,
}: DropdownButtonProps) {
  const { isOpen, setIsOpen, anchorRef } = useDropdown();

  return (
    <Component
      ref={anchorRef}
      className={className}
      onClick={() => {
        setIsOpen(!isOpen);
        onClick?.();
      }}
    >
      {children}
    </Component>
  );
}

interface DropdownMenuProps {
  children: ReactNode;
  className?: string;
  anchor?: 'bottom start' | 'bottom end' | 'top start' | 'top end';
}

export function DropdownMenu({
  children,
  className = '',
  anchor = 'bottom end',
}: DropdownMenuProps) {
  const { isOpen } = useDropdown();

  if (!isOpen) return null;

  const positionClasses: Record<string, string> = {
    'bottom start': 'top-full left-0 mt-1',
    'bottom end': 'top-full right-0 mt-1',
    'top start': 'bottom-full left-0 mb-1',
    'top end': 'bottom-full right-0 mb-1',
  };

  return (
    <div
      className={`absolute z-50 min-w-[16rem] rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800 ${positionClasses[anchor]} ${className}`}
    >
      {children}
    </div>
  );
}

interface DropdownItemProps {
  href?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function DropdownItem({ href, children, className = '', onClick }: DropdownItemProps) {
  const { setIsOpen } = useDropdown();

  const handleClick = () => {
    setIsOpen(false);
    onClick?.();
  };

  const baseClasses = `group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700 [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-zinc-400 group-hover:[&>svg]:text-zinc-500 dark:[&>svg]:text-zinc-500 dark:group-hover:[&>svg]:text-zinc-400 ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={baseClasses} onClick={handleClick}>
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-zinc-200 dark:border-zinc-700" />;
}

interface DropdownLabelProps {
  children: ReactNode;
  className?: string;
}

export function DropdownLabel({ children, className = '' }: DropdownLabelProps) {
  return <span className={`flex-1 ${className}`}>{children}</span>;
}

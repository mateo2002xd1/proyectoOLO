'use client';

import { createContext, type ReactNode } from 'react';
import Link from 'next/link';

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  setIsOpen: () => {},
});

interface SidebarProps {
  children: ReactNode;
  className?: string;
}

export function Sidebar({ children, className = '' }: SidebarProps) {
  return (
    <aside
      className={`flex h-full w-64 flex-col border-r border-zinc-200 bg-[#F3F3F3] dark:border-zinc-700 dark:bg-zinc-900 ${className}`}
    >
      {children}
    </aside>
  );
}

interface SidebarHeaderProps {
  children: ReactNode;
  className?: string;
}

export function SidebarHeader({ children, className = '' }: SidebarHeaderProps) {
  return (
    <div className={`border-b border-zinc-200 px-4 py-3 dark:border-zinc-700 ${className}`}>
      {children}
    </div>
  );
}

interface SidebarBodyProps {
  children: ReactNode;
  className?: string;
}

export function SidebarBody({ children, className = '' }: SidebarBodyProps) {
  return (
    <div className={`flex-1 overflow-y-auto px-3 py-4 ${className}`}>{children}</div>
  );
}

interface SidebarFooterProps {
  children: ReactNode;
  className?: string;
}

export function SidebarFooter({ children, className = '' }: SidebarFooterProps) {
  return (
    <div className={`border-t border-zinc-200 px-3 py-3 dark:border-zinc-700 ${className}`}>
      {children}
    </div>
  );
}

interface SidebarItemProps {
  href?: string;
  children: ReactNode;
  className?: string;
  current?: boolean;
  onClick?: () => void;
}

export function SidebarItem({
  href,
  children,
  className = '',
  current = false,
  onClick,
}: SidebarItemProps) {
  const baseClasses = `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition [&>svg]:size-5 [&>svg]:shrink-0 ${
    current
      ? 'bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-white [&>svg]:text-zinc-900 dark:[&>svg]:text-white'
      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white [&>svg]:text-zinc-500 dark:[&>svg]:text-zinc-400 group-hover:[&>svg]:text-zinc-900 dark:group-hover:[&>svg]:text-white'
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={baseClasses} onClick={onClick}>
      {children}
    </button>
  );
}

interface SidebarLabelProps {
  children: ReactNode;
  className?: string;
}

export function SidebarLabel({ children, className = '' }: SidebarLabelProps) {
  return <span className={`flex-1 truncate ${className}`}>{children}</span>;
}

interface SidebarSectionProps {
  children: ReactNode;
  className?: string;
}

export function SidebarSection({ children, className = '' }: SidebarSectionProps) {
  return <div className={`flex flex-col gap-1 ${className}`}>{children}</div>;
}

interface SidebarHeadingProps {
  children: ReactNode;
  className?: string;
}

export function SidebarHeading({ children, className = '' }: SidebarHeadingProps) {
  return (
    <p
      className={`px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ${className}`}
    >
      {children}
    </p>
  );
}

export function SidebarSpacer() {
  return <div className="flex-1" />;
}

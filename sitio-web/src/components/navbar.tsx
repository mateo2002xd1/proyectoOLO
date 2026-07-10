'use client';

import { type ReactNode } from 'react';

interface NavbarProps {
  children: ReactNode;
  className?: string;
}

export function Navbar({ children, className = '' }: NavbarProps) {
  return (
    <nav
      className={`flex h-14 items-center gap-4 border-b border-zinc-200 bg-white px-4 dark:border-zinc-700 dark:bg-zinc-900 ${className}`}
    >
      {children}
    </nav>
  );
}

export function NavbarSpacer() {
  return <div className="flex-1" />;
}

interface NavbarSectionProps {
  children: ReactNode;
  className?: string;
}

export function NavbarSection({ children, className = '' }: NavbarSectionProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>{children}</div>
  );
}

interface NavbarItemProps {
  href?: string;
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
}

export function NavbarItem({ href, children, className = '', ...props }: NavbarItemProps) {
  const baseClasses = `group flex size-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:fill-current ${className}`;

  if (href) {
    return (
      <a href={href} className={baseClasses} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={baseClasses} {...props}>
      {children}
    </button>
  );
}

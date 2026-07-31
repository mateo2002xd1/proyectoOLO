'use client';

import { type ReactNode } from 'react';

interface SidebarLayoutProps {
  sidebar: ReactNode;
  navbar?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SidebarLayout({
  sidebar,
  navbar,
  children,
  className = '',
}: SidebarLayoutProps) {
  return (
    <div className={`flex h-screen bg-[#F3F3F3] dark:bg-[#0b1121] ${className}`}>
      <div className="hidden lg:flex lg:w-64 lg:flex-col">{sidebar}</div>

      <div className="flex min-w-0 flex-1 flex-col">
        {navbar && <div className="lg:hidden">{navbar}</div>}

        <main className="flex-1 overflow-y-auto bg-[#FFFFFF] dark:bg-[#131b2f]">
          {children}
        </main>
      </div>
    </div>
  );
}

'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface SidebarLayoutProps {
  sidebar: ReactNode;
  navbar?: ReactNode;
  children: ReactNode;
  className?: string;
  isSidebarOpen?: boolean;
  onCloseSidebar?: () => void;
}

export function SidebarLayout({
  sidebar,
  navbar,
  children,
  className = '',
  isSidebarOpen = false,
  onCloseSidebar,
}: SidebarLayoutProps) {
  const pathname = usePathname();
  const onCloseSidebarRef = useRef(onCloseSidebar);

  useEffect(() => {
    onCloseSidebarRef.current = onCloseSidebar;
  }, [onCloseSidebar]);

  useEffect(() => {
    if (onCloseSidebarRef.current) {
      onCloseSidebarRef.current();
    }
  }, [pathname]);

  return (
    <div className={`flex h-dvh bg-white dark:bg-[#131B2E] ${className}`}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-900/80 lg:hidden"
          onClick={onCloseSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Mobile Slide-in + Desktop Static) */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {navbar && <div className="lg:hidden">{navbar}</div>}

        <main className="flex-1 overflow-y-auto bg-[#FFFFFF] dark:bg-[#131B2E]">
          {children}
        </main>
      </div>
    </div>
  );
}

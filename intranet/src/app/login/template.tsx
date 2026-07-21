'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Page order map — used to determine slide direction.
 * Higher number = deeper in the auth flow.
 */
const PAGE_ORDER: Record<string, number> = {
  '/login': 0,
  '/login/recovery': 1,
  '/login/first-login': 1,
  '/login/security-questions': 2,
  '/login/reset-password': 3,
  '/login/reset-success': 4,
};

export default function LoginTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const directionRef = useRef<'forward' | 'backward'>('forward');

  // Calculate direction BEFORE effect so it's available on first render
  if (typeof window !== 'undefined') {
    const prev = sessionStorage.getItem('auth-prev-path');
    if (prev && prev !== pathname) {
      const prevOrder = PAGE_ORDER[prev] ?? 0;
      const currOrder = PAGE_ORDER[pathname] ?? 0;
      directionRef.current = currOrder >= prevOrder ? 'forward' : 'backward';
    }
  }

  useEffect(() => {
    sessionStorage.setItem('auth-prev-path', pathname);
  }, [pathname]);

  return (
    <div className={`auth-page-transition auth-slide-${directionRef.current}`}>
      {children}
    </div>
  );
}

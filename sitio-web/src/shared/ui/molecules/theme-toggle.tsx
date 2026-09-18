'use client';

import { useSyncExternalStore, useEffect } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/20/solid';

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

const getThemeSnapshot = () => document.documentElement.classList.contains('dark');
const getThemeServerSnapshot = () => false;

interface ThemeToggleProps {
  /** Mismo estilo que `NavbarItem` por defecto — pásalo si el botón vive en otro contexto (p. ej. el sidebar). */
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getThemeServerSnapshot);

  useEffect(() => {
    const s = localStorage.getItem('olo-theme');
    if (s === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (s === 'light') {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const isDarkNow = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', isDarkNow);
    localStorage.setItem('olo-theme', isDarkNow ? 'dark' : 'light');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Cambiar tema"
      className={
        className ||
        'group flex size-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-[#94a3b8] dark:hover:bg-zinc-800 dark:hover:text-white [&>svg]:size-5 [&>svg]:shrink-0'
      }
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

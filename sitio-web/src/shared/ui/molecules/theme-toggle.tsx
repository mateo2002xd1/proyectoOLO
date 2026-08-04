'use client';

import React, { useSyncExternalStore, useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/20/solid';

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

const getThemeSnapshot = () => document.documentElement.classList.contains('dark');
const getThemeServerSnapshot = () => false;

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getThemeServerSnapshot);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const isDarkNow = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', isDarkNow);
    localStorage.setItem('olo-theme', isDarkNow ? 'dark' : 'light');
  };

  if (!mounted) {
    return (
      <div className="fixed top-4 right-4 z-[100] p-2.5 rounded-full w-[40px] h-[40px]" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-[100] p-2.5 rounded-full bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md shadow-md border border-zinc-200 dark:border-[#1e293b] text-zinc-600 hover:text-zinc-900 dark:text-[#94a3b8] dark:hover:text-white transition-all hover:scale-105 active:scale-95"
      aria-label="Cambiar tema"
    >
      {isDark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
    </button>
  );
}

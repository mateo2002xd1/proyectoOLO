'use client';

import React, { useSyncExternalStore, useEffect, useState, useRef } from 'react';
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
  
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  useEffect(() => {
    const loadPosition = () => {
      const saved = localStorage.getItem('theme-toggle-pos');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
            const minX = -(window.innerWidth - 56);
            const maxX = 16;
            const minY = -16;
            const maxY = window.innerHeight - 56;
            setTranslate({
              x: Math.max(minX, Math.min(parsed.x, maxX)),
              y: Math.max(minY, Math.min(parsed.y, maxY))
            });
          }
        } catch (e) {
          // ignore
        }
      }
    };

    loadPosition();
    setMounted(true);

    const handleResize = () => {
      setTranslate(prev => {
        const minX = -(window.innerWidth - 56);
        const maxX = 16;
        const minY = -16;
        const maxY = window.innerHeight - 56;
        const safeX = Math.max(minX, Math.min(prev.x, maxX));
        const safeY = Math.max(minY, Math.min(prev.y, maxY));
        
        if (safeX !== prev.x || safeY !== prev.y) {
          const newPos = { x: safeX, y: safeY };
          localStorage.setItem('theme-toggle-pos', JSON.stringify(newPos));
          return newPos;
        }
        return prev;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    if (hasMoved.current) return;
    const isDarkNow = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', isDarkNow);
    localStorage.setItem('olo-theme', isDarkNow ? 'dark' : 'light');
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    isDragging.current = true;
    hasMoved.current = false;
    startPos.current = { x: e.clientX - translate.x, y: e.clientY - translate.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging.current) return;
    
    let newX = e.clientX - startPos.current.x;
    let newY = e.clientY - startPos.current.y;
    
    if (Math.abs(newX - translate.x) > 3 || Math.abs(newY - translate.y) > 3) {
      hasMoved.current = true;
    }
    
    const minX = -(window.innerWidth - 56);
    const maxX = 16;
    const minY = -16;
    const maxY = window.innerHeight - 56;
    
    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));
    
    setTranslate({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (hasMoved.current) {
      localStorage.setItem('theme-toggle-pos', JSON.stringify(translate));
    }
  };

  if (!mounted) {
    return (
      <div className="fixed top-4 right-4 z-[100] p-2.5 rounded-full w-[40px] h-[40px]" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ transform: `translate3d(${translate.x}px, ${translate.y}px, 0)` }}
      className="fixed top-4 right-4 z-[100] p-2.5 rounded-full bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md shadow-md border border-zinc-200 dark:border-[#1e293b] text-zinc-600 hover:text-zinc-900 dark:text-[#94a3b8] dark:hover:text-white transition-colors cursor-grab active:cursor-grabbing touch-none"
      aria-label="Cambiar tema"
    >
      <div className="pointer-events-none">
        {isDark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
      </div>
    </button>
  );
}

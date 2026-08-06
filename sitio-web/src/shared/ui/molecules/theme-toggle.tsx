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

const getSnapPosition = (x: number, y: number) => {
  if (typeof window === 'undefined') return { x: 0, y: 0 };
  const minX = Math.min(-(window.innerWidth - 72), 0);
  const maxY = Math.max(window.innerHeight - 72, 0);

  const snapX = x < minX / 2 ? minX : 0;
  const snapY = y > maxY / 2 ? maxY : 0;

  return { x: snapX, y: snapY };
};

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getThemeServerSnapshot);
  const [mounted, setMounted] = useState(false);
  
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDraggingState, setIsDraggingState] = useState(false);
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
            setTranslate(getSnapPosition(parsed.x, parsed.y));
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
        const newPos = getSnapPosition(prev.x, prev.y);
        
        if (newPos.x !== prev.x || newPos.y !== prev.y) {
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
    setIsDraggingState(true);
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
    
    const minX = Math.min(-(window.innerWidth - 72), 0);
    const maxY = Math.max(window.innerHeight - 72, 0);
    
    newX = Math.max(minX, Math.min(newX, 0));
    newY = Math.max(0, Math.min(newY, maxY));
    
    setTranslate({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    isDragging.current = false;
    setIsDraggingState(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (hasMoved.current) {
      const snappedPos = getSnapPosition(translate.x, translate.y);
      setTranslate(snappedPos);
      localStorage.setItem('theme-toggle-pos', JSON.stringify(snappedPos));
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
      className={`fixed top-4 right-4 z-[100] p-2.5 rounded-full bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md shadow-md border border-zinc-200 dark:border-[#1e293b] text-zinc-600 hover:text-zinc-900 dark:text-[#94a3b8] dark:hover:text-white cursor-grab touch-none ${isDraggingState ? 'active:cursor-grabbing transition-colors duration-200' : 'transition-all duration-300 ease-out'}`}
      aria-label="Cambiar tema"
    >
      <div className="pointer-events-none">
        {isDark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
      </div>
    </button>
  );
}

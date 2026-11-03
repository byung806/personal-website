'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'snow';

interface SnowContextType {
  isSnowing: boolean;
  toggleSnow: () => void;
}

const SnowContext = createContext<SnowContextType | undefined>(undefined);

/// Whether it's snowing on the homepage. Snowing turns the page into a winter day (`snow-day` on <html>), or a winter
/// night (`snow-night`) for visitors in dark mode. On by default; the on/off choice is remembered, and it starts off for reduced motion.
export function SnowProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSnowing, setIsSnowing] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch {}
    setIsSnowing(saved ? saved === 'on' : !matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    const query = matchMedia('(prefers-color-scheme: dark)');
    const update = () => setDark(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const snowing = isSnowing && pathname === '/';
  useEffect(() => {
    document.documentElement.classList.toggle('snow-day', snowing && !dark);
    document.documentElement.classList.toggle('snow-night', snowing && dark);
  }, [snowing, dark]);

  const toggleSnow = () => {
    setIsSnowing(prev => {
      try { localStorage.setItem(STORAGE_KEY, prev ? 'off' : 'on'); } catch {}
      return !prev;
    });
  };

  return (
    <SnowContext.Provider value={{ isSnowing, toggleSnow }}>
      {children}
    </SnowContext.Provider>
  );
}

export function useSnow() {
  const context = useContext(SnowContext);
  if (context === undefined) throw new Error('useSnow must be used within a SnowProvider');
  return context;
}

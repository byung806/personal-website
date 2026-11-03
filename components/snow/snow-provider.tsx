'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'snow';

interface SnowContextType {
  /// The snow can be offered at all: NEXT_PUBLIC_SNOW=1, or `?snow=1` / `?snow=0` for a single visit.
  available: boolean;
  isSnowing: boolean;
  toggleSnow: () => void;
}

const SnowContext = createContext<SnowContextType | undefined>(undefined);

function snowAvailable() {
  const param = new URLSearchParams(window.location.search).get('snow');
  if (param !== null) return param !== '0';
  return process.env.NEXT_PUBLIC_SNOW === '1';
}

/// Whether it's snowing on the homepage. Snowing turns the page into a winter night (the `snow-night` class on <html>).
/// A visitor's on/off choice is remembered; it starts off for anyone who prefers reduced motion.
export function SnowProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [available, setAvailable] = useState(false);
  const [isSnowing, setIsSnowing] = useState(false);

  useEffect(() => {
    if (!snowAvailable()) return;
    let saved: string | null = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch {}
    setAvailable(true);
    setIsSnowing(saved ? saved === 'on' : !matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const night = available && isSnowing && pathname === '/';
  useEffect(() => {
    document.documentElement.classList.toggle('snow-night', night);
  }, [night]);

  const toggleSnow = () => {
    setIsSnowing(prev => {
      try { localStorage.setItem(STORAGE_KEY, prev ? 'off' : 'on'); } catch {}
      return !prev;
    });
  };

  return (
    <SnowContext.Provider value={{ available, isSnowing, toggleSnow }}>
      {children}
    </SnowContext.Provider>
  );
}

export function useSnow() {
  const context = useContext(SnowContext);
  if (context === undefined) throw new Error('useSnow must be used within a SnowProvider');
  return context;
}

'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import Snowfall from 'react-snowfall';

type Season = 'winter' | 'spring' | 'summer' | 'fall';

type SnowfallContextType = {
  isSnowing: boolean;
  toggleSnow: () => void;
  season: Season;
  accentColor: string;
};

const SnowfallContext = createContext<SnowfallContextType | null>(null);

export function useSnowfall() {
  const ctx = useContext(SnowfallContext);
  if (!ctx) throw new Error('useSnowfall must be used within SnowfallProvider');
  return ctx;
}

export default function SnowfallProvider({ children }: { children: React.ReactNode }) {
  const { season, accentColor } = useMemo(() => {
    const m = new Date().getMonth();
    let season: Season;
    if (m === 11 || m <= 1) season = 'winter';
    else if (m <= 4) season = 'spring';
    else if (m <= 7) season = 'summer';
    else season = 'fall';

    const palette: Record<Season, string> = {
      winter: 'rgba(68, 88, 104, 0.45)',
      spring: 'rgba(72, 112, 82, 0.45)',
      summer: 'rgba(70, 110, 110, 0.45)',
      fall: 'rgba(120, 96, 72, 0.45)',
    };

    return { season, accentColor: palette[season] };
  }, []);

  const [isSnowing, setIsSnowing] = useState(false);
  const toggleSnow = () => {
    if (season === 'winter') setIsSnowing((v) => !v);
  };

  return (
    <SnowfallContext.Provider value={{ isSnowing, toggleSnow, season, accentColor }}>
      {isSnowing && season === 'winter' && (
        <Snowfall
          snowflakeCount={60}
          style={{ position: 'fixed', width: '100vw', height: '100vh', top: 0, left: 0, pointerEvents: 'none', zIndex: 20 }}
        />
      )}
      {children}
    </SnowfallContext.Provider>
  );
}

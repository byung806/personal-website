'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SnowfallContextType {
  isSnowing: boolean;
  toggleSnow: () => void;
}

const SnowfallContext = createContext<SnowfallContextType | undefined>(undefined);

export function SnowfallProvider({ children }: { children: ReactNode }) {
  // Check if it's December (month 11 in 0-indexed months)
  const isDecember = new Date().getMonth() === 11;
  const [isSnowing, setIsSnowing] = useState(isDecember);

  const toggleSnow = () => {
    setIsSnowing((prev) => !prev);
  };

  return (
    <SnowfallContext.Provider value={{ isSnowing, toggleSnow }}>
      {children}
    </SnowfallContext.Provider>
  );
}

export function useSnowfall() {
  const context = useContext(SnowfallContext);
  if (context === undefined) {
    throw new Error('useSnowfall must be used within a SnowfallProvider');
  }
  return context;
}


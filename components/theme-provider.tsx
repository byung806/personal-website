'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode, createContext, useContext, useState, useEffect } from 'react';

interface StyleContextType {
  currentStyle: string;
  setCurrentStyle: (style: string) => void;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export function useStyle() {
  const context = useContext(StyleContext);
  if (context === undefined) {
    throw new Error('useStyle must be used within a StyleProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentStyle, setCurrentStyle] = useState('clean');

  useEffect(() => {
    // Apply style classes to body
    const body = document.body;

    // Remove existing style classes
    body.classList.remove('style-keyboard', 'style-terminal', 'style-light', 'style-dark');

    // Add current style class
    body.classList.add(`style-${currentStyle}`);

    // Add transition class for smooth font changes
    body.classList.add('transition-all', 'duration-500', 'ease-out');

    // Apply font family based on style with smooth transitions
    if (currentStyle === 'keyboard') {
      body.classList.add('font-serif');
      body.classList.remove('font-mono', 'font-sans');
    } else if (currentStyle === 'terminal') {
      body.classList.add('font-mono');
      body.classList.remove('font-serif', 'font-sans');
    } else {
      body.classList.add('font-sans');
      body.classList.remove('font-serif', 'font-mono');
    }
  }, [currentStyle]);

  return (
    <StyleContext.Provider value={{ currentStyle, setCurrentStyle }}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        enableColorScheme={false}
        forcedTheme="light"
        storageKey="theme"
      >
        {children}
      </NextThemesProvider>
    </StyleContext.Provider>
  );
}
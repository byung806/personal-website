"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Terminal, Blocks, Sunset, Zap, Keyboard } from 'lucide-react';

export interface Theme {
  name: string;
  background: string;
  textColor: string;
  accentColor: string;
  linkColor: string;
  font: string;
  icon: string | React.ReactElement;
  description: string;
}

// Custom Gengar Icon
const GengarIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    {/* Gengar body */}
    <ellipse cx="12" cy="14" rx="8" ry="6" fill="#4A148C"/>
    {/* Eyes */}
    <circle cx="8" cy="10" r="2" fill="#E1BEE7"/>
    <circle cx="16" cy="10" r="2" fill="#E1BEE7"/>
    <circle cx="8" cy="10" r="1" fill="#4A148C"/>
    <circle cx="16" cy="10" r="1" fill="#4A148C"/>
    {/* Mouth */}
    <path d="M10 16 Q12 18 14 16" stroke="#E1BEE7" strokeWidth="1.5" fill="none"/>
    {/* Spikes */}
    <path d="M4 14 L6 12 L8 14" fill="#4A148C"/>
    <path d="M16 14 L18 12 L20 14" fill="#4A148C"/>
  </svg>
);

export const themes: Theme[] = [
  {
    name: 'default',
    background: '#33254d',
    textColor: '#a88beb',
    accentColor: '#a88beb',
    linkColor: '#ff4136',
    font: 'font-mono',
    icon: <GengarIcon />,
    description: 'Gengar Purple Theme'
  },
  {
    name: 'keyboard',
    background: '#f8f6f0',
    textColor: '#222222',
    accentColor: '#222222',
    linkColor: '#666666',
    font: 'crimson-text',
    icon: <Keyboard className="w-6 h-6" />,
    description: 'Keyboard Serif Theme'
  },
  {
    name: 'terminal',
    background: '#000000',
    textColor: '#00FF00',
    accentColor: '#00FF00',
    linkColor: '#888888',
    font: 'font-mono',
    icon: <Terminal className="w-6 h-6" />,
    description: 'Terminal Theme'
  },
  {
    name: 'minecraft',
    background: '#87CEEB',
    textColor: '#2F4F2F',
    accentColor: '#8B4513',
    linkColor: '#FF4500',
    font: 'press-start-2p',
    icon: <Blocks className="w-6 h-6" />,
    description: 'Minecraft Block Theme'
  },
  {
    name: 'matrix',
    background: '#000000',
    textColor: '#00FF00',
    accentColor: '#00FF00',
    linkColor: '#FF0000',
    font: 'font-mono',
    icon: <Zap className="w-6 h-6" />,
    description: 'Matrix Green Theme'
  },
  {
    name: 'sunset',
    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FF6B9D 100%)',
    textColor: '#FFE66D',
    accentColor: '#FFE66D',
    linkColor: '#4ECDC4',
    font: 'font-mono',
    icon: <Sunset className="w-6 h-6" />,
    description: 'Sunset Gradient Theme'
  }
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeName: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  const setTheme = (themeName: string) => {
    const theme = themes.find(t => t.name === themeName);
    if (theme) {
      setCurrentTheme(theme);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
"use client";

import React from 'react';
import { useTheme, themes } from '@/ui/contexts/ThemeContext';

export default function ThemeSwitcher() {
  const { currentTheme, setTheme } = useTheme();

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30">
      <div className="flex space-x-4 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
        {themes.map((theme) => (
          <button
            key={theme.name}
            onClick={() => setTheme(theme.name)}
            className={`
              w-12 h-12 rounded-lg flex items-center justify-center text-2xl
              transition-all duration-300 hover:scale-110 hover:shadow-lg
              ${currentTheme.name === theme.name 
                ? 'ring-2 ring-white shadow-lg scale-105' 
                : 'hover:bg-white/10'
              }
            `}
            style={{
              backgroundColor: currentTheme.name === theme.name 
                ? `${theme.accentColor}20` 
                : 'transparent'
            }}
            title={theme.description}
          >
            {theme.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
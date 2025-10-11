'use client';

import { useTheme } from 'next-themes';
import { useStyle } from './theme-provider';
import { Keyboard, Terminal, Sun, Moon } from 'lucide-react';

export default function DarkModeCard() {
  const { theme, setTheme } = useTheme();
  const { currentStyle, setCurrentStyle } = useStyle();

  const styles = [
    { id: 'keyboard', icon: Keyboard, name: 'Keyboard', bg: 'bg-[#fdbf26]' },
    { id: 'terminal', icon: Terminal, name: 'Terminal', bg: 'bg-[#4e5a28]' },
    { id: 'light', icon: Sun, name: 'Light', bg: 'bg-yellow-50' },
    { id: 'dark', icon: Moon, name: 'Dark', bg: 'bg-slate-800' },
  ];

  const handleStyleChange = (styleId: string) => {
    setCurrentStyle(styleId);
    // if (styleId === 'keyboard' || styleId === 'terminal') {
    //   setTheme('light');
    // } else {
    //   setTheme(styleId);
    // }
  };

  // Get the background class for the current style
  const currentStyleData = styles.find(s => s.id === currentStyle);
  const cardBg = currentStyleData?.bg || 'bg-card';

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-700 ease-out bg-white">
      <div className="mb-6">
        <h3 className={`text-sm font-medium text-center transition-all duration-500 ${
          currentStyle === 'keyboard' ? 'font-serif' : 
          currentStyle === 'terminal' ? 'font-mono' : 'font-sans'
        }`}>
          {currentStyleData?.name || 'Theme'}
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {styles.map((style) => {
          const IconComponent = style.icon;
          const isActive = currentStyle === style.id;
          
          return (
            <button
              key={style.id}
              onClick={() => handleStyleChange(style.id)}
              className={`p-6 rounded-full transition-all duration-500 ease-out flex items-center justify-center transform hover:scale-105 ${
                isActive 
                  ? 'bg-brand/20 shadow-lg scale-110' 
                  : 'bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 hover:shadow-md'
              }`}
            >
              <IconComponent className={`w-5 h-5 transition-all duration-300 ${
                isActive ? 'text-brand' : 'text-text'
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
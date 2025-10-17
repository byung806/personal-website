'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';

export default function DebugThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-4 z-50">
      <div className="text-xs font-mono text-gray-600 dark:text-gray-400 mb-2">
        Debug Theme Toggle
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setTheme('light')}
          className={`p-2 rounded ${theme === 'light' ? 'bg-gray-200 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          title="Light"
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-200 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          title="Dark"
        >
          <Moon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`p-2 rounded ${theme === 'system' ? 'bg-gray-200 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          title="System"
        >
          <Monitor className="w-4 h-4" />
        </button>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
        Current: {currentTheme}
      </div>
    </div>
  );
}

import Link from 'next/link';
import React from 'react';
import { useTheme } from '@/ui/contexts/ThemeContext';

export default function Navbar() {
    const { currentTheme } = useTheme();
    
    return (
        <nav className="bg-transparent">
            <div className="flex justify-start items-center space-x-8">
                    <Link 
                        href="/" 
                        className={`hover:underline transition-all duration-500 ease-in-out text-lg ${currentTheme.font}`}
                        style={{ color: currentTheme.linkColor }}
                    >
                        me
                    </Link>
                    <Link 
                        href="/projects" 
                        className={`hover:underline transition-all duration-500 ease-in-out text-lg ${currentTheme.font}`}
                        style={{ color: currentTheme.linkColor }}
                    >
                        projects
                    </Link>
                    <Link 
                        href="/cv" 
                        className={`hover:underline transition-all duration-500 ease-in-out text-lg ${currentTheme.font}`}
                        style={{ color: currentTheme.linkColor }}
                    >
                        cv
                    </Link>
            </div>
        </nav>
    );
}

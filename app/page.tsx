"use client";

import Image from "next/image";
import Navbar from "@/ui/components/navbar";
import ThemeSwitcher from "@/ui/components/theme-switcher";
import { useTheme, themes } from "@/ui/contexts/ThemeContext";

export default function Home() {
    const { currentTheme, setTheme } = useTheme();

    // Handle gradient backgrounds
    const backgroundStyle = currentTheme.background.startsWith('linear-gradient') 
        ? { background: currentTheme.background }
        : { backgroundColor: currentTheme.background };

    return (
        <div 
            className={`min-h-screen text-white ${currentTheme.font} transition-all duration-500 ease-in-out`}
            style={backgroundStyle}
        >
            <div className="min-h-screen flex flex-col justify-center">
                <div className="max-w-lg mx-auto space-y-10">
                    {/* Navigation */}
                    <Navbar />

                     {/* Hero Section */}
                     <div className="space-y-6">
                         <h1 
                             className={`text-3xl font-bold lowercase transition-all duration-500 ease-in-out ${
                                 currentTheme.name === 'sunset' 
                                     ? 'bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 bg-clip-text text-transparent animate-pulse' 
                                     : ''
                             }`}
                             style={{ 
                                 color: currentTheme.name === 'sunset' ? 'transparent' : currentTheme.accentColor 
                             }}
                         >
                             Bryan Yung
                         </h1>
                         
                         <div 
                             className={`space-y-3 leading-tight transition-all duration-500 ease-in-out ${
                                 currentTheme.name === 'sunset' 
                                     ? 'text-shadow-lg' 
                                     : ''
                             }`}
                             style={{ 
                                 color: currentTheme.textColor,
                                 textShadow: currentTheme.name === 'sunset' 
                                     ? '2px 2px 4px rgba(0,0,0,0.3)' 
                                     : 'none'
                             }}
                         >
                            <p className={currentTheme.name === 'sunset' ? 'animate-bounce' : ''}>
                                i like teaching, music, and competitive programming.
                            </p>
                            
                            <p className={currentTheme.name === 'sunset' ? 'animate-pulse' : ''}>
                                i'm a student at carnegie mellon university studying computer science
                            </p>
                            
                            <p className={currentTheme.name === 'sunset' ? 'animate-pulse' : ''}>
                                byung806 [at] gmail [dot] com
                            </p>
                        </div>
                    </div>

                     {/* Footer Links */}
                     <div className="flex space-x-6">
                         <a 
                             href="https://www.linkedin.com/in/bryan-yung-9724952b9/"
                             className="hover:underline transition-all duration-500 ease-in-out"
                             style={{ color: currentTheme.linkColor }}
                             target="_blank"
                             rel="noopener noreferrer"
                         >
                             linkedin
                         </a>
                         <a 
                             href="https://github.com/byung806"
                             className="hover:underline transition-all duration-500 ease-in-out"
                             style={{ color: currentTheme.linkColor }}
                             target="_blank"
                             rel="noopener noreferrer"
                         >
                             github
                         </a>
                     </div>

                    {/* Theme Switcher */}
                    <div className="flex space-x-4">
                        {themes.map((theme) => (
                            <button
                                key={theme.name}
                                onClick={() => setTheme(theme.name)}
                                className={`
                                    w-6 h-6 rounded-lg flex items-center justify-center text-2xl
                                    transition-all duration-300 hover:scale-110
                                `}
                                style={{
                                    filter: currentTheme.name === theme.name 
                                        ? 'none' 
                                        : 'grayscale(100%)',
                                    backgroundColor: 'transparent',
                                    color: currentTheme.name === 'keyboard' 
                                        ? (currentTheme.name === theme.name ? '#222222' : '#888888')
                                        : 'currentColor'
                                }}
                                title={theme.description}
                            >
                                {theme.icon}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
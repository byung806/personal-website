"use client";

import Link from "next/link";
import Navbar from "@/ui/components/navbar";
import { useTheme } from "@/ui/contexts/ThemeContext";

export default function NotFound() {
    const { currentTheme } = useTheme();

    // Handle gradient backgrounds
    const backgroundStyle = currentTheme.background.startsWith('linear-gradient') 
        ? { background: currentTheme.background }
        : { backgroundColor: currentTheme.background };

    return (
        <div 
            className={`min-h-screen text-white ${currentTheme.font} transition-all duration-500 ease-in-out`}
            style={backgroundStyle}
        >
            <div className="min-h-screen flex flex-col justify-center items-center relative">
                {/* Navigation */}
                <div className="absolute top-8 left-8 z-20">
                    <Navbar />
                </div>
                <div className="text-center space-y-8">
                    {/* Big 404 */}
                    <h1 
                        className={`text-9xl font-bold transition-all duration-500 ease-in-out ${
                            currentTheme.name === 'sunset' 
                                ? 'bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 bg-clip-text text-transparent animate-pulse' 
                                : ''
                        }`}
                        style={{ 
                            color: currentTheme.name === 'sunset' ? 'transparent' : currentTheme.accentColor 
                        }}
                    >
                        404
                    </h1>
                    
                    {/* Error Message */}
                    <div 
                        className="space-y-4 transition-all duration-500 ease-in-out"
                        style={{ color: currentTheme.textColor }}
                    >
                        <p className="text-xl">
                            page not found
                        </p>
                        <p className="text-lg opacity-80">
                            looks like you've wandered into the void
                        </p>
                    </div>

                    {/* Back to Home */}
                    <div className="pt-8">
                        <Link 
                            href="/"
                            className="inline-block px-6 py-3 rounded-lg border-2 transition-all duration-300 hover:scale-105"
                            style={{ 
                                borderColor: currentTheme.accentColor,
                                color: currentTheme.accentColor
                            }}
                        >
                            return home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
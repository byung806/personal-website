"use client";

import Navbar from "@/ui/components/navbar";
import { useTheme } from "@/ui/contexts/ThemeContext";

export default function CV() {
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
            <div className="min-h-screen flex flex-col justify-center items-center">
                {/* Navigation */}
                <div className="absolute top-8 left-8 z-20">
                    <Navbar />
                </div>
                Under construction
            </div>
        </div>
    );
}
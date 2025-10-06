"use client";

import Image from "next/image";
import Navbar from "@/ui/components/navbar";
import ThemeSwitcher from "@/ui/components/theme-switcher";
import { useTheme, themes } from "@/ui/contexts/ThemeContext";
import { useState } from "react";
import { ArrowUpRight, Copy, Check, Star } from "lucide-react";

export default function Home() {
    const { currentTheme, setTheme } = useTheme();
    const [copied, setCopied] = useState(false);
    const isGengar = currentTheme.name === 'default';
    const linkColorClass = isGengar
        ? 'text-[#ff4136] hover:text-[#ff6b5f]'
        : 'text-[#353c3c] hover:text-[#4a5252]';

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
                <div className={`max-w-lg mx-auto ${isGengar ? 'lowercase' : ''}`}>
                    <div className="space-y-10 mt-40 mb-40">
                        {/* Navigation */}
                        <Navbar />

                        {/* Hero Section */}
                        <div className="space-y-6">
                            <h1 
                                className={`text-3xl font-bold transition-all duration-500 ease-in-out ${
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
                                    I like teaching, music, and competitive programming.
                                </p>
                                
                                <p className={currentTheme.name === 'sunset' ? 'animate-pulse' : ''}>
                                    I'm a student at Carnegie Mellon University studying computer science.
                                </p>
                            </div>
                        </div>

                        {/* Footer Links */}
                        <div className="space-y-2">
                            <div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const email = "byung806@gmail.com";
                                        if (navigator.clipboard && navigator.clipboard.writeText) {
                                            navigator.clipboard.writeText(email).then(() => {
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 1500);
                                            }).catch(() => {
                                                // Fallback for browsers without clipboard permission
                                                const textArea = document.createElement('textarea');
                                                textArea.value = email;
                                                document.body.appendChild(textArea);
                                                textArea.select();
                                                try { document.execCommand('copy'); } catch {}
                                                document.body.removeChild(textArea);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 1500);
                                            });
                                        } else {
                                            const textArea = document.createElement('textarea');
                                            textArea.value = email;
                                            document.body.appendChild(textArea);
                                            textArea.select();
                                            try { document.execCommand('copy'); } catch {}
                                            document.body.removeChild(textArea);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 1500);
                                        }
                                    }}
                                    className={`group inline-flex items-center gap-1 underline transition-all duration-200 ease-in-out hover:scale-105 ${linkColorClass}`}
                                    style={{ background: 'transparent' }}
                                    aria-label="Copy email to clipboard"
                                    title="Copy email to clipboard"
                                >
                                    byung806@gmail.com
                                    <span
                                        className={`ml-0.5 inline-flex items-center transform translate-y-[1px] transition-all duration-200 opacity-0 group-hover:opacity-100 ${copied ? 'scale-110' : 'scale-100'}`}
                                        aria-hidden="true"
                                    >
                                        {copied ? (
                                            <Check className="w-[0.92em] h-[0.92em]" />
                                        ) : (
                                            <Copy className="w-[0.92em] h-[0.92em]" />
                                        )}
                                    </span>
                                </button>
                            </div>
                            <div className="flex items-center space-x-6">
                            <a 
                                href="https://www.linkedin.com/in/bryan-yung-9724952b9/"
                                className={`inline-flex items-center underline transition-colors duration-200 ease-in-out ${linkColorClass}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn (opens in new tab)"
                                title="LinkedIn (opens in new tab)"
                            >
                                linkedin
                                <ArrowUpRight className="ml-0.5 align-middle transform translate-y-[1px] w-[0.92em] h-[0.92em]" aria-hidden="true" />
                            </a>
                            <a 
                                href="https://github.com/byung806"
                                className={`inline-flex items-center underline transition-colors duration-200 ease-in-out ${linkColorClass}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GitHub (opens in new tab)"
                                title="GitHub (opens in new tab)"
                            >
                                github
                                <ArrowUpRight className="ml-0.5 align-middle transform translate-y-[1px] w-[0.92em] h-[0.92em]" aria-hidden="true" />
                            </a>
                            </div>
                        </div>
                    </div>

                    {/* Selected Projects */}
                    <div className="space-y-6">
                        <h2 
                            className={`text-2xl font-bold transition-all duration-500 ease-in-out ${
                                currentTheme.name === 'sunset' 
                                    ? 'bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 bg-clip-text text-transparent animate-pulse' 
                                    : ''
                            }`}
                            style={{ 
                                color: currentTheme.name === 'sunset' ? 'transparent' : currentTheme.accentColor 
                            }}
                        >
                            Selected Projects
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Competitive Programming */}
                            <div className="rounded-lg border border-transparent hover:border-blue-400 p-2 transition-all duration-200 cursor-pointer group">
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg px-4 py-3">
                                    <span className="text-white font-bold text-sm">competitive-programming</span>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">competitive-programming</h3>
                                            <p className="text-sm text-gray-600">Solutions to competitive programming problems</p>
                                        </div>
                                        <Star className="w-4 h-4 text-yellow-500 ml-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Music Visualizer */}
                            <div className="rounded-lg border border-transparent hover:border-blue-400 p-2 transition-all duration-200 cursor-pointer group">
                                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg px-4 py-3">
                                    <span className="text-white font-bold text-sm">music-visualizer</span>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">music-visualizer</h3>
                                            <p className="text-sm text-gray-600">Real-time audio visualization tool</p>
                                        </div>
                                        <Star className="w-4 h-4 text-yellow-500 ml-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Physics Engine */}
                            <div className="rounded-lg border border-transparent hover:border-blue-400 p-2 transition-all duration-200 cursor-pointer group">
                                <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg px-4 py-3">
                                    <span className="text-white font-bold text-sm">physics-engine</span>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">physics-engine</h3>
                                            <p className="text-sm text-gray-600">2D physics simulation with collisions</p>
                                        </div>
                                        <Star className="w-4 h-4 text-yellow-500 ml-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Web Portfolio */}
                            <div className="rounded-lg border border-transparent hover:border-blue-400 p-2 transition-all duration-200 cursor-pointer group">
                                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg px-4 py-3">
                                    <span className="text-white font-bold text-sm">web-portfolio</span>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">web-portfolio</h3>
                                            <p className="text-sm text-gray-600">Personal website with theme switching</p>
                                        </div>
                                        <Star className="w-4 h-4 text-yellow-500 ml-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Algorithm Visualizer */}
                            <div className="rounded-lg border border-transparent hover:border-blue-400 p-2 transition-all duration-200 cursor-pointer group">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg px-4 py-3">
                                    <span className="text-white font-bold text-sm">algorithm-visualizer</span>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">algorithm-visualizer</h3>
                                            <p className="text-sm text-gray-600">Interactive sorting algorithm demonstrations</p>
                                        </div>
                                        <Star className="w-4 h-4 text-yellow-500 ml-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Data Structures Library */}
                            <div className="rounded-lg border border-transparent hover:border-blue-400 p-2 transition-all duration-200 cursor-pointer group">
                                <div className="bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg px-4 py-3">
                                    <span className="text-white font-bold text-sm">data-structures</span>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">data-structures</h3>
                                            <p className="text-sm text-gray-600">Custom implementations of common data structures</p>
                                        </div>
                                        <Star className="w-4 h-4 text-yellow-500 ml-2" />
                                    </div>
                                </div>
                            </div>
                        </div>
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
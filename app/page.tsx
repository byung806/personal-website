"use client";

import Image from "next/image";
import Navbar from "@/ui/components/navbar";

export default function Home() {
    return (
        <div className="min-h-screen bg-[#33254d] text-white font-mono">
            {/* Navigation */}
            <Navbar />

            {/* Floating Gengar Sprite */}
            <div className="fixed top-20 right-8 z-40">
                <div className="w-16 h-16">
                    <svg viewBox="0 0 64 64" className="w-full h-full">
                        {/* Gengar pixel art sprite */}
                        <rect x="8" y="16" width="48" height="32" fill="#4A148C" rx="4"/>
                        <rect x="12" y="20" width="8" height="8" fill="#E1BEE7" rx="2"/>
                        <rect x="44" y="20" width="8" height="8" fill="#E1BEE7" rx="2"/>
                        <rect x="28" y="32" width="8" height="4" fill="#E1BEE7" rx="2"/>
                        <rect x="16" y="40" width="8" height="8" fill="#4A148C" rx="2"/>
                        <rect x="40" y="40" width="8" height="8" fill="#4A148C" rx="2"/>
                        <rect x="24" y="48" width="16" height="8" fill="#4A148C" rx="2"/>
                    </svg>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-8 pt-32 pb-16">
                {/* Hero Section */}
                <div className="space-y-6">
                    <h1 className="text-4xl font-bold text-[#a88beb] lowercase">
                        Bryan Yung
                    </h1>
                    
                    <div className="space-y-4 text-[#a88beb] leading-relaxed">
                        <p>
                            i like teaching, music, and competitive programming.
                        </p>
                        
                        <p>
                            i'm a student at carnegie mellon university studying computer science
                        </p>
                        
                        <p>
                            byung806 [at] gmail [dot] com
                        </p>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="mt-16 flex space-x-6">
                    <a 
                        href="https://www.linkedin.com/in/bryan-yung-9724952b9/"
                        className="text-[#FF3333] hover:underline transition-all"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        linkedin
                    </a>
                    <a 
                        href="https://github.com/byung806"
                        className="text-[#FF3333] hover:underline transition-all"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        github
                    </a>
                </div>
            </div>
        </div>
    );
}

import Link from 'next/link';
import React from 'react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-sm border-b border-gray-200/50">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo/Name */}
                    <Link href="/" className="text-xl font-semibold text-gray-900 hover:text-accent transition-colors">
                        BY
                    </Link>
                    
                    {/* Navigation Links */}
                    <div className="hidden md:flex space-x-8">
                        <Link href="#home" className="text-gray-600 hover:text-accent transition-colors font-medium">
                            Home
                        </Link>
                        <Link href="#projects" className="text-gray-600 hover:text-accent transition-colors font-medium">
                            Projects
                        </Link>
                        <Link href="#about" className="text-gray-600 hover:text-accent transition-colors font-medium">
                            About
                        </Link>
                        <Link href="#contact" className="text-gray-600 hover:text-accent transition-colors font-medium">
                            Contact
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}

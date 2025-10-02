import Link from 'next/link';
import React from 'react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex justify-center items-center space-x-8">
                    <Link href="/" className="text-[#FF3333] hover:underline transition-all font-mono text-lg">
                        me
                    </Link>
                    <Link href="/projects" className="text-[#FF3333] hover:underline transition-all font-mono text-lg">
                        projects
                    </Link>
                    <Link href="/cv" className="text-[#FF3333] hover:underline transition-all font-mono text-lg">
                        cv
                    </Link>
                </div>
            </div>
        </nav>
    );
}

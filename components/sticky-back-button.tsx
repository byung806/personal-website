'use client';

import Link from 'next/link';
import SiteTitle from './site-title';

export default function StickyBackButton() {
  return (
    <div className="fixed top-0 z-40 w-full px-4 md:px-4 lg:px-6 py-8 pointer-events-none">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between gap-12 relative">
          <Link 
            href="/" 
            className="flex items-center text-[11px] uppercase tracking-widest font-sans text-gray-900 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors pointer-events-auto"
          >
            ← Projects
          </Link>
          
          {/* Placeholder to match spacing */}
          <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none opacity-0 select-none">
            <SiteTitle isPlaceholder />
          </div>
        </div>
      </div>
    </div>
  );
}

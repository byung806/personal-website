'use client';

import Link from 'next/link';

export default function StickyBackButton() {
  return (
    <div className="fixed top-0 z-40 w-full px-4 md:px-4 lg:px-6 py-8 pointer-events-none">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-start justify-between gap-12">
          <Link 
            href="/" 
            className="inline-block text-[11px] uppercase tracking-widest font-sans text-gray-900 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors pointer-events-auto"
          >
            ← Projects
          </Link>
        </div>
      </div>
    </div>
  );
}

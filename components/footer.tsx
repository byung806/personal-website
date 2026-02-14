'use client';

import { Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full px-6 md:px-10 lg:px-16 pt-8 pb-16">
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-500">
          © {year} Designed & Developed by Bryan Yung
        </p>
        <div className="flex items-center gap-8">
          <a
            href="https://www.linkedin.com/in/bryan-yung-9724952b9/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-900 opacity-40 hover:opacity-100 transition-opacity"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-6 h-6" strokeWidth={2} />
          </a>
          <a
            href="mailto:byung806@gmail.com"
            className="text-gray-900 opacity-40 hover:opacity-100 transition-opacity"
            aria-label="Email"
          >
            <Mail className="w-6 h-6" strokeWidth={2} />
          </a>
        </div>
      </div>
    </footer>
  );
}

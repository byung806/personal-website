'use client';

import { Linkedin, Mail, Check, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const year = new Date().getFullYear();
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText('byung806@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <button
            onClick={copyEmail}
            className="group relative w-6 h-6 cursor-pointer"
            aria-label="Copy email"
          >
            <Mail
              className={`w-6 h-6 absolute inset-0 text-gray-900 transition-all duration-300 ${copied ? 'opacity-0 scale-75' : 'opacity-40 group-hover:opacity-100 scale-100'}`}
              strokeWidth={2}
            />
            <Check
              className={`w-6 h-6 absolute inset-0 text-[#81cc3e] transition-all duration-300 ${copied ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
              strokeWidth={2}
            />
          </button>
          <a
            href="/Bryan_Yung_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center text-gray-900 opacity-40 hover:opacity-100 transition-opacity text-[13px] font-semibold uppercase tracking-widest"
            aria-label="Resume"
          >
            Resume
            <ArrowUpRight className="ml-0.5 w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </a>
        </div>
      </div>
    </footer>
  );
}

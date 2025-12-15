'use client';

import { useState } from 'react';
import { ArrowUpRight, Download, Copy, Check, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactSection() {
  const [emailCopied, setEmailCopied] = useState(false);

  const handleEmailClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await navigator.clipboard.writeText('byung806@gmail.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-8 sm:mt-10">
      <a
        href="/Bryan_Yung_Resume.pdf"
        download
        className="group flex items-center gap-2 text-sm sm:text-base text-black/60 hover:text-black/85 transition-colors"
      >
        <span>Resume</span>
        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
      </a>
      
      <a
        href="https://github.com/byung806/"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 text-sm sm:text-base text-black/60 hover:text-black/85 transition-colors"
      >
        <span>GitHub</span>
        <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
      </a>
      
      <a
        href="https://www.linkedin.com/in/bryan-yung-9724952b9/"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 text-sm sm:text-base text-black/60 hover:text-black/85 transition-colors"
      >
        <span>LinkedIn</span>
        <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
      </a>
      
      <button
        onClick={handleEmailClick}
        className="group flex items-center gap-2 text-sm sm:text-base text-black/60 hover:text-black/85 transition-colors"
      >
        <span>Email</span>
        <AnimatePresence mode="wait">
          {emailCopied ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
            </motion.div>
          ) : (
            <motion.div
              key="mail"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}


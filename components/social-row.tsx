'use client';

import { useState } from 'react';
import { ArrowUpRight, Download, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function SocialRow() {
  const [isOpen, setIsOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const handleEmailClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await navigator.clipboard.writeText('byung806@gmail.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4 text-sm">
      <Link
        href="/guestbook"
        className="text-gray-600 hover:text-gray-900 transition-colors"
      >
        Guestbook
      </Link>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          {isOpen ? 'Close' : 'Contact'}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[120px] z-50"
            >
              <div className="flex flex-col gap-3">
                <a
                  href="/Bryan_Yung_Resume.pdf"
                  download
                  className="flex items-center justify-between text-gray-600 hover:text-gray-900 transition-colors group"
                >
                  <span>Resume</span>
                  <Download className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
                <a
                  href="https://github.com/byung806/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-gray-600 hover:text-gray-900 transition-colors group"
                >
                  <span>GitHub</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
                <a
                  href="https://www.linkedin.com/in/bryan-yung-9724952b9/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-gray-600 hover:text-gray-900 transition-colors group"
                >
                  <span>LinkedIn</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
                <button
                  onClick={handleEmailClick}
                  className="flex items-center justify-between text-gray-600 hover:text-gray-900 transition-colors group text-left"
                >
                  <span>Email</span>
                  <AnimatePresence mode="wait">
                    {emailCopied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import StickyBackButton from './sticky-back-button';
import SiteTitle from './site-title';
import { useState } from 'react';
import { ArrowUpRight, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FunButton from './funbutton';
import SeasonButton from './season-button';
import { useSnowfall } from './snowfall-provider';

export default function HeroSection() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const showBackButton = pathname.startsWith('/p/');
  const [isOpen, setIsOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const { season } = useSnowfall();

  const handleEmailClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await navigator.clipboard.writeText('byung806@gmail.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <>
      {showBackButton && <StickyBackButton />}
      <section className="w-full px-4 md:px-6 py-8 bg-white dark:bg-[#0F0F0F]">
        <div className="max-w-[1600px] mx-auto relative">
          {/* Centered title - doesn't affect flex layout */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0">
            <SiteTitle />
          </div>

          {/* Main content - flex between */}
          <div className="flex items-start justify-between">
            {/* Left: Editorial text */}
            {!showBackButton && (
              <div className="max-w-[320px] text-[11px] uppercase tracking-wide leading-relaxed font-sans text-gray-900 dark:text-gray-100">
                Hi, I'm <span className="font-bold text-[#FF4500]">Bryan Yung</span>, a computer science student at{' '}
                <span className="underline decoration-1 underline-offset-2">Carnegie Mellon University</span>, currently exploring{' '}
                <span className="font-semibold">AI</span>, <span className="font-semibold">HCI</span>, and{' '}
                <span className="font-semibold">3D</span>.
              </div>
            )}

            {/* Spacer on project pages */}
            {showBackButton && <div />}

            {/* Right: Navigation */}
            <div className={`flex items-center gap-6 text-[11px] uppercase tracking-widest font-sans ${showBackButton ? 'hidden md:flex' : ''}`}>
              <a
                href="/Bryan_Yung_Resume.pdf"
                download
                className="text-gray-900 dark:text-gray-200 hover:text-[#FF4500] dark:hover:text-gray-100 transition-colors"
              >
                Resume
              </a>

              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="uppercase text-gray-900 dark:text-gray-200 hover:text-[#FF4500] dark:hover:text-gray-100 transition-colors"
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
                      className="absolute right-0 top-full mt-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-sm p-3 min-w-[110px] z-50"
                    >
                      <div className="flex flex-col gap-2.5 text-[12px] uppercase">
                        <a
                          href="https://github.com/byung806/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
                        >
                          <span>GitHub</span>
                          <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                        </a>
                        <a
                          href="https://www.linkedin.com/in/bryan-yung-9724952b9/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
                        >
                          <span>LinkedIn</span>
                          <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                        </a>
                        <button
                          onClick={handleEmailClick}
                          className="flex items-center justify-between text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group text-left"
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
                                <Check className="w-3 h-3 text-green-600" strokeWidth={1.5} />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="copy"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Copy className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {season === 'winter' ? (
                <FunButton />
              ) : (
                <SeasonButton />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

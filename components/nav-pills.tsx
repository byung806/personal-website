'use client';

import { motion } from 'framer-motion';

interface NavPillsProps {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function NavPills({ tabs, activeTab, setActiveTab }: NavPillsProps) {
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <motion.div
      className="max-w-[1200px] mx-auto px-6 lg:px-10 pb-8"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.2, // Start with the first card
        duration: 0.6,
        ease: "easeOut"
      }}
    >
      <div className="flex justify-center">
        <div className="relative inline-flex items-center bg-muted rounded-pill p-1 border border-border">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`relative z-10 px-4 h-10 rounded-pill text-sm font-medium transition-colors ${activeTab === tab
                ? 'text-text'
                : 'text-subtext hover:text-text'
                }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.3 + (index * 0.02), // Slight stagger for each tab
                duration: 0.4,
                ease: "easeOut"
              }}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="pill"
                  className="absolute inset-0 bg-card border border-border rounded-pill shadow-soft -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
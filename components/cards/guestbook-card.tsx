'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from '../project-card';

interface GuestbookEntry {
  id: number;
  username: string;
  message: string;
  createdAt: string;
}

export default function GuestbookCard() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/guestbook')
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.slice(0, 6)); // Show latest 6 entries
        setIsLoaded(true);
      })
      .catch((err) => console.error('Failed to fetch guestbook:', err));
  }, []);

  return (
    <ProjectCard
      title="Guestbook"
      subtitle="INTERACTIVE"
      tags={['Next.js, Prisma, Postgres']}
      projectUrl="/p/guestbook"
      bgColor="#f6f6f6"
    >
      <div className="relative w-full min-h-[280px] p-6 overflow-hidden group/guestbook">
        {/* Colorful gradient background - appears on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover/guestbook:opacity-50 dark:group-hover/guestbook:opacity-40 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle at 15% 25%, rgba(139, 92, 246, 0.5), transparent 45%), radial-gradient(circle at 85% 75%, rgba(59, 130, 246, 0.5), transparent 45%), radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.35), transparent 55%)',
          }}
        />
        
        {/* Messages */}
        <div className="relative space-y-3">
          {entries.length === 0 ? (
            <div className="flex items-center justify-center h-[220px]">
              <p className="text-sm text-gray-400 dark:text-gray-500">No messages yet</p>
            </div>
          ) : (
            <AnimatePresence>
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1 - index * 0.15, y: 0 }}
                  transition={{ duration: 0.3, delay: isLoaded ? index * 0.08 : 0 }}
                  className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2"
                >
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {entry.username}
                  </span>
                  : {entry.message}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        
        {/* Fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#f6f6f6] dark:from-[#1A1A1A] to-transparent pointer-events-none" />
      </div>
    </ProjectCard>
  );
}

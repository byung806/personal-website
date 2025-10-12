'use client';

import { motion } from 'framer-motion';
import { Card } from '@/content/cards';
// import BentoCard from './bento-card';

interface BentoGridProps {
  cards: Card[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      duration: 0.6,
    },
  },
};

export default function BentoGrid({ cards }: BentoGridProps) {
  return (
    <section id="projects" className="w-full px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 py-12 -mt-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-12 text-center">
          <div className="inline-block relative px-8 py-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 relative z-10">
              Some of my creations...
            </h2>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 opacity-45 blur-2xl rounded-full"></div>
          </div>
        </div>
        <motion.div
          layout
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)] grid-flow-dense"
        >
          {cards.map((card) => {
            const CardComponent = card.component;
            const isLarge = card.rowSpan === 2;
            return (
              <motion.div
                key={card.id}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.1, ease: "easeOut" } }}
                className={`bg-card rounded-[1.5rem] overflow-hidden ${isLarge ? 'row-span-2' : 'row-span-1'
                  }`}
              >
                <CardComponent />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
'use client';

import { motion } from 'framer-motion';
import { Card } from '@/content/cards';
import BentoCard from './bento-card';

interface BentoGridProps {
  cards: Card[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Slightly faster stagger
      delayChildren: 0.2,
    },
  },
};

export default function BentoGrid({ cards }: BentoGridProps) {
  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-12 lg:pb-18">
      <motion.div
        layout
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        style={{
          gridAutoRows: '320px',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.6 }}
      >
        {cards.map((card, index) => {
          const CardComponent = card.component;
          return (
            <BentoCard key={card.id} card={card} index={index}>
              <CardComponent />
            </BentoCard>
          );
        })}
      </motion.div>
    </div>
  );
}
'use client';

import { motion } from 'framer-motion';
import { Card } from '@/content/cards';

interface BentoCardProps {
  card: Card;
  children: React.ReactNode;
  index?: number;
}

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

export default function BentoCard({ card, children, index }: BentoCardProps) {
  const w = card.colSpan || 1;
  const h = card.rowSpan || 1;
  
  // Force proper grid alignment
  const gridClasses = `col-span-${w} row-span-${h}`;

  return (
    <motion.div
      layout
      variants={cardVariants}
      className={`${gridClasses} bg-card rounded-3xl overflow-hidden`}
      style={{
        gridColumn: `span ${w}`,
        gridRow: `span ${h}`,
      }}
      // whileHover={{ scale: 1.015 }}
      // transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.6 }}
    >
      {children}
    </motion.div>
  );
}
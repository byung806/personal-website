'use client';

import { motion } from 'framer-motion';
import { Card } from '@/content/cards';
import { useEffect, useState } from 'react';

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const w = isMobile && card.mobileColSpan ? card.mobileColSpan : card.colSpan || 1;
  const h = isMobile && card.mobileRowSpan ? card.mobileRowSpan : card.rowSpan || 1;

  return (
    <motion.div
      layout
      variants={cardVariants}
      className="bg-card rounded-3xl overflow-hidden"
      style={{
        gridColumn: `span ${w}`,
        gridRow: `span ${h}`,
        aspectRatio: `${w} / ${h}`,
      }}
    >
      {children}
    </motion.div>
  );
}
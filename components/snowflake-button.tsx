'use client';

import { MouseEvent, useState } from 'react';
import { Snowflake } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnowfall } from './snowfall-provider';

export default function SnowflakeButton() {
  const { isSnowing, toggleSnow, accentColor, season } = useSnowfall();
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const getRotation = () => {
    if (isSnowing) {
      return isHovered ? 180 : 150;
    } else {
      return isHovered ? 0 : 30;
    }
  };

  const currentColor = isSnowing ? '#3b82f6' : (isHovered ? '#FF4500' : 'currentColor');

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 40 - 20,
      y: Math.random() * 40 - 20,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);
    toggleSnow();
  };

  return (
    <div className="relative inline-flex items-center">
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative transition-colors"
        aria-label="Toggle snowfall"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        style={{ color: currentColor }}
      >
        <motion.div
          animate={{ rotate: getRotation() }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <Snowflake className="w-[14px] h-[14px]" strokeWidth={2} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{ opacity: 0, x: particle.x, y: particle.y, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { MouseEvent, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { funButtonOccasions, FunButtonEffect } from './funbutton-config';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnowfall } from './snowfall-provider';

export default function FunButton() {
  const { isSnowing, toggleSnow, accentColor, season } = useSnowfall();
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const now = new Date();
  // removed fireworkTrigger

  // Find the first matching occasion for the current date/season
  const occasion = funButtonOccasions.find(o => o.isActive(now, season))!;
  const Icon: LucideIcon = occasion.icon;
  // Color logic
  const [bursting, setBursting] = useState(false);
  let iconColor = '#22292f'; // default gray
  if (isHovered) {
    iconColor = '#FF4500';
  } else if (occasion.effect === 'toggle' && isSnowing && occasion.color) {
    iconColor = occasion.color;
  } else if (occasion.effect === 'burst' && bursting && occasion.color) {
    iconColor = occasion.color;
  }
  const particleColor = occasion.color;
  let getRotation = () => 0;

  // Effect logic per occasion
  let handleClick = (e: MouseEvent<HTMLButtonElement>) => {};
  if (occasion.effect === 'toggle') {
    getRotation = () => (isSnowing ? (isHovered ? 180 : 150) : (isHovered ? 0 : 30));
    handleClick = (e: MouseEvent<HTMLButtonElement>) => {
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
  } else if (occasion.effect === 'fireworks' || occasion.effect === 'burst') {
    getRotation = () => (isHovered ? 20 : 0);
    handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 40 - 20,
        y: Math.random() * 40 - 20,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 1000);
    };
  } else if (occasion.effect === 'burst') {
    getRotation = () => (isHovered ? -15 : 0);
    handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      setBursting(true);
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 40 - 20,
        y: Math.random() * 40 - 20,
      }));
      setParticles(newParticles);
      setTimeout(() => {
        setParticles([]);
        setBursting(false);
      }, 1000);
    };
  }

  return (
    <div className="relative inline-flex items-center">
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative transition-colors"
        aria-label="Fun button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        style={{ color: iconColor }}
      >
        <motion.div
          animate={{ rotate: getRotation() }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <Icon className="w-[16px] h-[16px]" strokeWidth={2} />
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
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: particleColor }} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

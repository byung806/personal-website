'use client';

import { useState } from 'react';
import { Snowflake } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnowfall } from './snowfall-provider';

export default function SnowflakeButton() {
  const { isSnowing, toggleSnow } = useSnowfall();
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Calculate rotation based on state:
  // - Inactive + not hovered: 0°
  // - Inactive + hovered: 15° (rotate a little)
  // - Active + not hovered: 30° (active position)
  // - Active + hovered: 20° (rotate back a little)
  const getRotation = () => {
    if (isSnowing) {
      return isHovered ? 180 : 150; // Active: 30° normally, 20° on hover
    } else {
      return isHovered ? 0 : 30; // Inactive: 0° normally, 15° on hover
    }
  };

  const handleClick = () => {
    // Create particles
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 40 - 20,
      y: Math.random() * 40 - 20,
    }));
    setParticles(newParticles);

    // Remove particles after animation
    setTimeout(() => {
      setParticles([]);
    }, 1000);

    toggleSnow();
  };

  return (
    <div className="relative inline-flex items-center">
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative p-1.5 rounded-md transition-colors ${
          isSnowing
            ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
        aria-label="Toggle snowfall"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{
            rotate: getRotation(),
          }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
          }}
        >
          <Snowflake className="w-6 h-6" />
        </motion.div>
      </motion.button>

      {/* Particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
            }}
            animate={{
              opacity: 0,
              x: particle.x,
              y: particle.y,
              scale: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
          >
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}


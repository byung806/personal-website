'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSnowfall } from './snowfall-provider';

export default function SeasonButton() {
  const { season, accentColor } = useSnowfall();
  const [isHovered, setIsHovered] = useState(false);

  const emoji = season === 'spring' ? '🍃' : season === 'summer' ? '☀️' : '🍂';

  return (
    <motion.button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="p-1 rounded-md"
      aria-label="Seasonal accent"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      style={{ color: isHovered ? accentColor : accentColor }}
    >
      <span className="text-[18px] leading-none">
        {emoji}
      </span>
    </motion.button>
  );
}

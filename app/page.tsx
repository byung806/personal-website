'use client';

import ProjectsGallery from '@/components/projects-gallery';
import { cards } from '@/content/cards';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <ProjectsGallery cards={cards} />
    </motion.div>
  );
}
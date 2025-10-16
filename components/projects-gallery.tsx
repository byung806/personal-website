'use client';

import { motion } from 'framer-motion';
import { Card } from '@/content/cards';

interface ProjectsGalleryProps {
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
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
    },
  },
};

export default function ProjectsGallery({ cards }: ProjectsGalleryProps) {
  return (
    <section id="projects" className="w-full px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 py-12 -mt-12">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="columns-1 sm:columns-2 lg:columns-3 gap-4"
        >
          {cards.map((card) => {
            const CardComponent = card.component;
            return (
              <motion.div
                key={card.id}
                variants={cardVariants}
                className="break-inside-avoid mb-4"
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

'use client';

import { motion } from 'framer-motion';
import { Card } from '@/content/cards';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  viewport: { once: true, margin: '-40px 0px -40px 0px' },
  transition: (i: number) => ({ duration: 0.45, delay: i * 0.08, ease: [0.22, 0.61, 0.36, 1] }),
};

interface ProjectsGalleryProps {
  cards: Card[];
}

export default function ProjectsGallery({ cards }: ProjectsGalleryProps) {
  const leftCards = cards.filter((_, i) => i % 2 === 0);
  const rightCards = cards.filter((_, i) => i % 2 === 1);

  return (
    <section id="projects" className="w-full px-6 md:px-10 lg:px-16 pt-12 md:pt-16 pb-20">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-12 lg:gap-x-16 gap-y-8 md:gap-y-12 lg:gap-y-16">
          {/* Left column: name (invisible masonry cell) + cards */}
          <div className="flex flex-col gap-8 md:gap-12 lg:gap-16">
            <motion.div
              className="w-full mt-16 md:mt-20 lg:mt-24 py-2 select-text pointer-events-auto"
              initial={fadeIn.initial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={fadeIn.viewport}
              transition={fadeIn.transition(0)}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-black">
                Bryan Yung
              </h1>
              <p className="text-base md:text-lg lg:text-xl font-normal text-black/80 mt-10">
                Computer Science at Carnegie Mellon University
              </p>
            </motion.div>
            {leftCards.map((card, i) => {
              const CardComponent = card.component;
              const staggerIndex = 1 + i * 2;
              return (
                <motion.div
                  key={card.id}
                  className="w-full rounded-2xl"
                  initial={fadeIn.initial}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={fadeIn.viewport}
                  transition={fadeIn.transition(staggerIndex)}
                >
                  <CardComponent />
                </motion.div>
              );
            })}
          </div>
          {/* Right column: cards */}
          <div className="flex flex-col gap-8 md:gap-12 lg:gap-16">
            {rightCards.map((card, i) => {
              const CardComponent = card.component;
              const staggerIndex = 2 + i * 2;
              return (
                <motion.div
                  key={card.id}
                  className="w-full rounded-2xl"
                  initial={fadeIn.initial}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={fadeIn.viewport}
                  transition={fadeIn.transition(staggerIndex)}
                >
                  <CardComponent />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

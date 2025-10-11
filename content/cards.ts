import React from 'react';

export type Card = {
  id: string;
  title?: string;
  description?: string;
  tags: ('About' | 'Projects' | 'Play')[];
  colSpan: number; // width units (1-4)
  rowSpan: number; // height units (1-4)
  component: React.FC;
  mobileColSpan?: number; // mobile override
  mobileRowSpan?: number; // mobile override
};

// Import card components
import HeroCard from '@/components/hero-card';
import DarkModeCard from '@/components/dark-mode-card';
import RunwayCard from '@/components/runway-card';
import UMDResearchCard from '@/components/umd-research-card';
import GuestbookCard from '@/components/guestbook-card';
// import NowPlayingCard from '@/components/now-playing-card';
// import ContactCard from '@/components/contact-card';
import TimelineCard from '@/components/timeline-card';
// import StackCard from '@/components/stack-card';

export const cards: Card[] = [
  {
    id: 'hero',
    title: 'About Me',
    tags: ['About'],
    colSpan: 2,
    rowSpan: 1,
    mobileColSpan: 1,
    mobileRowSpan: 2,
    component: HeroCard,
  },
  {
    id: 'theme-switcher',
    title: 'Theme Switcher',
    tags: ['Play'],
    colSpan: 1, // w=1
    rowSpan: 1, // h=1
    component: DarkModeCard,
  },
  {
    id: 'runway',
    title: 'Runway Mobile',
    tags: ['Projects'],
    colSpan: 1, // w=1 mobile: becomes tall
    rowSpan: 2, // h=2 
    component: RunwayCard,
  },
  {
    id: 'umd-research',
    title: 'UMD Research',
    tags: ['Projects'],
    colSpan: 1,
    rowSpan: 1,
    component: UMDResearchCard,
  },
  {
    id: 'guestbook',
    title: 'Guestbook',
    tags: ['Play'],
    colSpan: 1, // w=1
    rowSpan: 1, // h=1
    component: GuestbookCard,
  },
  {
    id: 'timeline',
    title: "What's Next",
    tags: ['About'],
    colSpan: 1, // w=1
    rowSpan: 1, // h=1
    component: TimelineCard,
  },
];

export const initialOrder = cards.map(card => card.id);
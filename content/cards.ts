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
import RunwayCard from '@/components/runway-card';
import UMDResearchCard from '@/components/umd-research-card';
import GuestbookCard from '@/components/guestbook-card';
import FirstLightCard from '@/components/first-light-card';
import PlaceholderCard from '@/components/placeholder-card';

export const cards: Card[] = [
  {
    id: 'runway',
    title: 'Runway Mobile',
    tags: ['Projects'],
    colSpan: 1,
    rowSpan: 2,
    component: RunwayCard,
  },
  {
    id: 'first-light',
    title: 'First Light',
    tags: ['Projects'],
    colSpan: 1,
    rowSpan: 1,
    component: FirstLightCard,
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
    tags: ['Projects'],
    colSpan: 1,
    rowSpan: 1,
    component: GuestbookCard,
  },
  {
    id: 'placeholder-1',
    title: 'Boy Scouts App',
    tags: ['Projects'],
    colSpan: 1,
    rowSpan: 2,
    component: PlaceholderCard,
  },
  {
    id: 'placeholder-2',
    title: 'Exploring Concepts',
    tags: ['Projects'],
    colSpan: 1,
    rowSpan: 1,
    component: PlaceholderCard,
  },
];

export const initialOrder = cards.map(card => card.id);
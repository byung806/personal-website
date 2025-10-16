import React from 'react';

export type Card = {
  id: string;
  component: React.FC;
};

// Import card components
import RunwayCard from '@/components/cards/runway-card';
import RunwayWebCard from '@/components/cards/runway-web-card';
import UMDResearchCard from '@/components/cards/umd-research-card';
import GuestbookCard from '@/components/cards/guestbook-card';
import FirstLightCard from '@/components/cards/first-light-card';
import BoyScoutsCard from '@/components/cards/boy-scouts-card';

export const cards: Card[] = [
  {
    id: 'runway',
    component: RunwayCard,
  },
  {
    id: 'runway-web',
    component: RunwayWebCard,
  },
  {
    id: 'first-light',
    component: FirstLightCard,
  },
  {
    id: 'umd-research',
    component: UMDResearchCard,
  },
  {
    id: 'guestbook',
    component: GuestbookCard,
  },
  {
    id: 'boy-scouts',
    component: BoyScoutsCard,
  },
];

export const initialOrder = cards.map(card => card.id);
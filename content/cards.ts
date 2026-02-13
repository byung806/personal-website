import React from 'react';

export type Card = {
  id: string;
  component: React.FC;
};

// Import card components
import RunwayCard from '@/components/cards/runway-card';
import UMDResearchCard from '@/components/cards/umd-research-card';
import GuestbookCard from '@/components/cards/guestbook-card';
import FirstLightCard from '@/components/cards/first-light-card';
import BoyScoutsCard from '@/components/cards/boy-scouts-card';
import ThreeDRendererCard from '@/components/cards/3d-renderer-card';
import EchoCard from '@/components/cards/echo-card';

export const cards: Card[] = [
  {
    id: 'echo',
    component: EchoCard,
  },
  {
    id: 'runway',
    component: RunwayCard,
  },
  {
    id: 'umd-research',
    component: UMDResearchCard,
  },
  {
    id: 'first-light',
    component: FirstLightCard,
  },
  {
    id: '3d-renderer',
    component: ThreeDRendererCard,
  },
  {
    id: 'boy-scouts',
    component: BoyScoutsCard,
  },
  {
    id: 'guestbook',
    component: GuestbookCard,
  },
];

export const initialOrder = cards.map(card => card.id);
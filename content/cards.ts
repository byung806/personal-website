import React from 'react';

export type Card = {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  tags: ('About' | 'Projects' | 'Play')[];
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
    title: 'Runway',
    subtitle: 'MOBILE APP',
    tags: ['Projects'],
    component: RunwayCard,
  },
  {
    id: 'runway-web',
    title: 'Runway Website',
    subtitle: 'WEB APP',
    tags: ['Projects'],
    component: RunwayWebCard,
  },
  {
    id: 'first-light',
    title: 'First Light',
    subtitle: 'SWIFT PLAYGROUND',
    tags: ['Projects'],
    component: FirstLightCard,
  },
  {
    id: 'umd-research',
    title: 'UMD Research',
    subtitle: 'RESEARCH PROJECT',
    tags: ['Projects'],
    component: UMDResearchCard,
  },
  {
    id: 'guestbook',
    title: 'Guestbook',
    subtitle: 'INTERACTIVE',
    tags: ['Projects'],
    component: GuestbookCard,
  },
  {
    id: 'boy-scouts',
    title: 'TroopWebHost Improvement Project',
    subtitle: 'COMMUNITY PROJECT',
    tags: ['Projects'],
    component: BoyScoutsCard,
  },
];

export const initialOrder = cards.map(card => card.id);
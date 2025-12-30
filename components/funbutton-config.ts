import { Snowflake, Star, Leaf, Sun, LucideIcon } from 'lucide-react';

export type FunButtonEffect = 'toggle' | 'fireworks' | 'burst';

export interface FunButtonOccasion {
  name: string;
  icon: LucideIcon;
  color: string;
  effect: FunButtonEffect;
  isActive: (date: Date, season: string) => boolean;
}

export const funButtonOccasions: FunButtonOccasion[] = [
  {
    name: 'New Year Fireworks',
    icon: Star,
    color: '#FFD700',
    effect: 'fireworks',
    isActive: (date, season) =>
      season === 'winter' &&
      date.getMonth() === 0 &&
      date.getDate() >= 1 &&
      date.getDate() <= 5,
  },
  {
    name: 'Winter Default',
    icon: Snowflake,
    color: '#3b82f6',
    effect: 'toggle',
    isActive: (date, season) => season === 'winter',
  },
  {
    name: 'Spring',
    icon: Leaf,
    color: '#48b97d',
    effect: 'burst',
    isActive: (date, season) => season === 'spring',
  },
  {
    name: 'Summer',
    icon: Sun,
    color: '#FFD600',
    effect: 'burst',
    isActive: (date, season) => season === 'summer',
  },
  {
    name: 'Fall',
    icon: Leaf,
    color: '#FF8C42',
    effect: 'burst',
    isActive: (date, season) => season === 'fall',
  },
];

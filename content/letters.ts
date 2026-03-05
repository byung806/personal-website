export type Letter = {
  slug: string;
  to: string;
  year: string;
  date: string;
  photo: string;
  active?: boolean;
};

export const letters: Letter[] = [
  {
    slug: 'to-my-future-self',
    to: 'My Future Self',
    year: '2026',
    date: 'March 5, 2026',
    photo: '/letters/future-self.jpeg',
    active: true,
  },
  {
    slug: 'to-my-freshman-self',
    to: 'My Freshman Self',
    year: '2026',
    date: 'March 4, 2026',
    photo: '/letters/DSC03451.jpeg',
  },
  {
    slug: 'to-mr-chen',
    to: 'Mr. Chen',
    year: '2026',
    date: 'February 14, 2026',
    photo: '/letters/soupcan.jpeg',
  },
  {
    slug: 'to-bryan-in-2030',
    to: 'Bryan in 2030',
    year: '2026',
    date: 'January 1, 2026',
    photo: '/letters/cookies.jpeg',
  },
  {
    slug: 'to-mom-and-dad',
    to: 'Mom & Dad',
    year: '2025',
    date: 'December 25, 2025',
    photo: '/letters/IMG_5601.jpeg',
  },
  {
    slug: 'to-a-stranger',
    to: 'A Stranger on the Internet',
    year: '2025',
    date: 'November 3, 2025',
    photo: '/letters/IMG_7465.jpeg',
  },
  {
    slug: 'to-16-year-old-me',
    to: '16-Year-Old Me',
    year: '2025',
    date: 'October 10, 2025',
    photo: '/letters/IMG_7541.jpeg',
  },
];

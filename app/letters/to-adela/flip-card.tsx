'use client';

import FlipCard, { type FlipCardConfig } from '@/components/letters/flip-card';

const config: FlipCardConfig = {
  password: 'derphy',
  passwordImage: '/letters/dino_smaller.png',
  passwordQuestion: 'enter the password',
  passwordPlaceholder: "what's his name?",

  envelopeLabel: 'to adela',
  envelopeBg: '#bcd66a',
  envelopeStripes: `repeating-linear-gradient(
    45deg,
    #e85a8e 0px, #e85a8e 11px,
    #fdf0f5 11px, #fdf0f5 20px,
    #f4a6c6 20px, #f4a6c6 31px,
    #fdf0f5 31px, #fdf0f5 40px
  )`,
  envelopeInnerBg: 'linear-gradient(180deg, #ebcfac 0%, #ddb98e 100%)',
  envelopeLabelColor: '#4a5e1a',
  envelopeLabelShadow: '0 1px 0 rgba(255,250,240,0.4)',
  stampSrc: '/letters/dino_smaller.png',

  backgroundGradient: 'linear-gradient(160deg, #A3A1A6 45%, #DBCAAE 81%, #FDD597 89%)',
  blobColor: '#f3ac94',

  letterSrc: '/letters/adela-letter.png',

  polaroids: [
    { src: '/letters/adela/img1.JPG',  pos: { top: -2,    left: -130,  width: 150 }, initial: { x: 285,  y: 225  }, rotate: -8, delay: 1.8  },
    { src: '/letters/adela/img2.jpeg', pos: { top: -28,   right: -110, width: 160 }, initial: { x: -260, y: 246  }, rotate: 6,  delay: 1.95 },
    { src: '/letters/adela/img3.jpeg', pos: { top: '43%', left: -150,  width: 140 }, initial: { x: 310,  y: -40  }, rotate: 7,  delay: 2.1  },
    { src: '/letters/adela/img4.jpeg', pos: { top: '35%', right: -135, width: 150 }, initial: { x: -290, y: -128 }, rotate: -6, delay: 2.25 },
    { src: '/letters/adela/img5.jpeg', pos: { bottom: 10, left: -120,  width: 145 }, initial: { x: 278,  y: -204 }, rotate: -4, delay: 2.4  },
    { src: '/letters/adela/img6.JPG',  pos: { bottom: 30, right: -125, width: 140 }, initial: { x: -285, y: -187 }, rotate: 5,  delay: 2.55 },
  ],

  download: {
    src: '/letters/adela-1month.png',
    label: 'download',
    color: '#c4623f',
  },
};

export default function AdelaFlipCard({ children }: { children: React.ReactNode }) {
  return <FlipCard config={config}>{children}</FlipCard>;
}

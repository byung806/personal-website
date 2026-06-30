'use client';

import FlipCard, { type FlipCardConfig } from '@/components/letters/flip-card';

const config: FlipCardConfig = {
  envelopeLabel: 'to dad',
  envelopeBg: '#1e3a5f',
  envelopeStripes: `repeating-linear-gradient(
    45deg,
    #1a3a6b 0px, #1a3a6b 11px,
    #eef2f8 11px, #eef2f8 20px,
    #4a7ab8 20px, #4a7ab8 31px,
    #eef2f8 31px, #eef2f8 40px
  )`,
  envelopeInnerBg: 'linear-gradient(180deg, #ebcfac 0%, #ddb98e 100%)',
  envelopeLabelColor: '#e8eff8',
  envelopeLabelShadow: '0 1px 0 rgba(200,220,255,0.3)',

  backgroundGradient: 'linear-gradient(160deg, #c5cdd8 45%, #9fb8d4 75%, #d4c5a0 89%)',
  blobColor: '#8ab0cc',

  // no letterSrc → text mode: children rendered as prose inside the paper

  // Drop photos into /public/letters/dad/ as dad1.jpeg–dad6.jpeg to populate these
  polaroids: [
    { src: '/letters/dad/dad1.jpeg', pos: { top: -2,    left: -170,  width: 178 }, initial: { x: 320,  y: 225  }, rotate: -13, delay: 1.8  },
    { src: '/letters/dad/dad2.jpeg', pos: { top: -28,   right: -148, width: 188 }, initial: { x: -300, y: 246  }, rotate: 11,  delay: 1.95 },
    { src: '/letters/dad/dad3.jpeg', pos: { top: '32%', left: -188,  width: 168 }, initial: { x: 345,  y: -40  }, rotate: 13,  delay: 2.1  },
    { src: '/letters/dad/dad4.jpeg', pos: { top: '28%', right: -172, width: 178 }, initial: { x: -330, y: -128 }, rotate: -11, delay: 2.25 },
    { src: '/letters/dad/dad5.jpeg', pos: { top: '60%', left: -158,  width: 172 }, initial: { x: 315,  y: -204 }, rotate: -9,  delay: 2.4  },
    { src: '/letters/dad/dad6.jpeg', pos: { top: '56%', right: -162, width: 166 }, initial: { x: -320, y: -187 }, rotate: 10,  delay: 2.55 },
  ],
};

export default function DadFlipCard({ children }: { children: React.ReactNode }) {
  return <FlipCard config={config}>{children}</FlipCard>;
}

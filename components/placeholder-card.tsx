'use client';

import { TrafficCone, IceCreamCone } from 'lucide-react';

const cardThemes = [
  { bg: '#c8e6c9', color: 'text-green-700', fillColor: '#2e7d32', icon: TrafficCone },
  { bg: '#fff9c4', color: 'text-yellow-700', fillColor: '#f57f17', icon: TrafficCone },
  { bg: '#ffccbc', color: 'text-orange-700', fillColor: '#e64a19', icon: IceCreamCone },
];

export default function PlaceholderCard() {
  const theme = cardThemes[Math.floor(Math.random() * cardThemes.length)];
  const IconComponent = theme.icon;

  return (
    <div className="h-full text-gray-900 p-6 sm:p-8 flex flex-col items-center justify-center" style={{ backgroundColor: theme.bg }}>
      {/* Curved text */}
      <svg width="200" height="80" viewBox="0 0 200 80" className="opacity-70">
        <defs>
          <path id="curve" d="M 20,60 Q 100,10 180,60" fill="transparent" />
        </defs>
        <text className="text-sm font-semibold tracking-wider" fill={theme.fillColor}>
          <textPath href="#curve" startOffset="50%" textAnchor="middle">
            COMING SOON...
          </textPath>
        </text>
      </svg>

      <IconComponent className={`w-20 h-20 ${theme.color} opacity-50`} />
    </div>
  );
}

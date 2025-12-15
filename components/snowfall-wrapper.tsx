'use client';

import { Snowfall } from 'react-snowfall';
import { useSnowfall } from './snowfall-provider';

export default function SnowfallWrapper() {
  const { isSnowing } = useSnowfall();

  if (!isSnowing) return null;

  return (
    <Snowfall
      color="#dbeafe"
      snowflakeCount={100}
      speed={[0.5, 3]}
      wind={[-0.5, 2]}
      radius={[0.5, 3]}
      style={{
        position: 'fixed',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}


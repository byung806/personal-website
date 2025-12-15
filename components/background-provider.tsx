'use client';

import { useSnowfall } from './snowfall-provider';
import { useEffect } from 'react';

export default function BackgroundProvider() {
  const { isSnowing } = useSnowfall();
  const bgColor = isSnowing ? '#F2F8FB' : '#FBF7F1';

  useEffect(() => {
    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;
  }, [bgColor]);

  return null;
}


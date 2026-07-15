'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

// next/image that gently fades in when the image finishes loading — opacity only, no movement.
export default function FadeInImage({ className = '', ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...props}
      onLoad={() => setLoaded(true)}
      className={`${className} transition-opacity duration-700 ease-out ${
        loaded ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}

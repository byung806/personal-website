'use client';

import { useEffect, useState } from 'react';

/**
 * Whether the browser runs CSS scroll-driven animations (Chrome, Safari 26). Those run on the compositor, in step
 * with the scroll and with no JavaScript, so parallax uses them where it can and framer-motion everywhere else.
 */
export function useScrollDriven() {
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(CSS.supports('animation-timeline: scroll()')), []);
  return supported;
}

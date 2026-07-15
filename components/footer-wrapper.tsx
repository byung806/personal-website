'use client';

import { usePathname } from 'next/navigation';
import Footer from './footer';

export default function FooterWrapper() {
  const pathname = usePathname();
  if (pathname === '/p/guestbook' || pathname.startsWith('/letters') || pathname === '/adela-surprise' || pathname === '/memories' || pathname.startsWith('/memories/')) return null;
  return <Footer />;
}

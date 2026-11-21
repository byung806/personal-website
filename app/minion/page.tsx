import type { Metadata } from 'next';
import Chat from './chat';

export const metadata: Metadata = {
  title: 'minion', description: 'Your private conversation with Minion.',
  robots: { index: false, follow: false }, referrer: 'no-referrer',
};

export default function MinionPage() { return <Chat />; }

import type { Metadata } from 'next';
import MemoriesView from './memories-view';

export const metadata: Metadata = {
  title: 'Our Journal',
  robots: { index: false, follow: false },
};

export default function MemoriesPage() {
  return <MemoriesView />;
}

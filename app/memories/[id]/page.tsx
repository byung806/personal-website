import type { Metadata } from 'next';
import DetailView from './detail-view';

export const metadata: Metadata = {
  title: 'Our Journal',
  robots: { index: false, follow: false },
};

export default function MemoryDetailPage({ params }: { params: { id: string } }) {
  return <DetailView memoryId={params.id} />;
}

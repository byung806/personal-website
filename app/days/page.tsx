import type { Metadata } from 'next';
import DaysView from '@/components/days/days-view';

export const metadata: Metadata = {
  title: 'Days',
  robots: { index: false, follow: false },
};

export default function DaysPage() {
  return <DaysView />;
}

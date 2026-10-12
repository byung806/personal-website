import { redirect } from 'next/navigation';

// The letters index now lives as a section of /experiments; individual letters stay at /letters/<slug>.
export default function LettersPage() {
  redirect('/experiments#letters');
}

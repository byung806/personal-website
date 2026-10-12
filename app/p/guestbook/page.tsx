import { redirect } from 'next/navigation';

// The guestbook now lives as a section of /experiments.
export default function GuestbookPage() {
  redirect('/experiments#wall');
}

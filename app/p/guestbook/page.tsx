import { redirect } from 'next/navigation';

// The guestbook now lives as a section of /play.
export default function GuestbookPage() {
  redirect('/play#wall');
}

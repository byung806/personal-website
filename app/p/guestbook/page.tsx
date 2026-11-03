import { redirect } from 'next/navigation';

// The guestbook now lives on /play, where each signature is a rocket.
export default function GuestbookPage() {
  redirect('/play');
}

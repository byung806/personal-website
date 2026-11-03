import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Filter } from 'bad-words';
import { decodeRocket } from '@/lib/rocket';

export const dynamic = 'force-dynamic';

const filter = new Filter();

/** The guestbook as rockets (the experimental `guestbook_rockets` copy), newest first. */
export async function GET() {
  try {
    const rockets = await prisma.guestbookRocket.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
    return NextResponse.json(rockets);
  } catch (error) {
    console.error('Error in GET /api/rockets:', error);
    return NextResponse.json({ error: 'Failed to fetch rockets' }, { status: 500 });
  }
}

/** Sign the guestbook by launching a rocket: a name, an optional message and the rocket's design code. */
export async function POST(request: Request) {
  try {
    const { username = '', message = '', rocket } = await request.json();
    const name = String(username).trim();
    const note = String(message).trim();

    if (!name) return NextResponse.json({ error: 'Sign your name first!' }, { status: 400 });
    if (name.length > 50) return NextResponse.json({ error: "That's not your name..." }, { status: 400 });
    if (note.length > 500) return NextResponse.json({ error: 'Message is too long!' }, { status: 400 });
    if (!decodeRocket(rocket)) return NextResponse.json({ error: "That rocket won't fly!" }, { status: 400 });
    if (filter.isProfane(name) || filter.isProfane(note)) return NextResponse.json({ error: 'Nice try :)' }, { status: 400 });

    const entry = await prisma.guestbookRocket.create({ data: { username: name, message: note, rocket } });
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/rockets:', error);
    return NextResponse.json({ error: 'Failed to launch' }, { status: 500 });
  }
}

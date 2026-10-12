import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Filter } from 'bad-words';
import { NOTE_COLORS } from '@/lib/note-colors';

const filter = new Filter();

export async function GET() {
  try {
    const entries = await prisma.guestbookEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error in GET /api/guestbook:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guestbook entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { username, message, color } = await request.json();

    // Validation
    if (!username || !message) {
      return NextResponse.json(
        { error: 'Name and message are required!' },
        { status: 400 }
      );
    }

    if (username.length > 50) {
      return NextResponse.json(
        { error: 'That\'s not your name...' },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message is too long!' },
        { status: 400 }
      );
    }

    if (color !== undefined && !NOTE_COLORS.includes(color)) {
      return NextResponse.json(
        { error: 'Pick one of the colors!' },
        { status: 400 }
      );
    }

    // Profanity filter
    if (filter.isProfane(username) || filter.isProfane(message)) {
      return NextResponse.json(
        { error: 'Nice try :)' },
        { status: 400 }
      );
    }

    const entry = await prisma.guestbookEntry.create({
      data: {
        username,
        message,
        color,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/guestbook:', error);
    return NextResponse.json(
      { error: 'Failed to add guestbook entry' },
      { status: 500 }
    );
  }
}

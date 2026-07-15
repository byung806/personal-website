import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const memories = await prisma.memory.findMany({
      orderBy: { date: 'desc' },
      include: {
        photos: { orderBy: { order: 'asc' } },
        _count: { select: { comments: true } },
      },
    });

    const result = memories.map(({ _count, ...memory }) => ({
      ...memory,
      commentCount: _count.comments,
      photoCount: memory.photos.length,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/memories:', error);
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
  }
}

const AUTHORS = ['bryan', 'adela'];
const TYPES = ['photo', 'milestone'];

export async function POST(request: Request) {
  try {
    const { author, type, title, body, date, emoji, location, photos } = await request.json();

    if (!AUTHORS.includes(author)) {
      return NextResponse.json({ error: 'Invalid author' }, { status: 400 });
    }
    if (!TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    if (!title || typeof title !== 'string' || title.length > 200) {
      return NextResponse.json({ error: 'Title is required (max 200 chars)' }, { status: 400 });
    }
    if (!date || Number.isNaN(Date.parse(date))) {
      return NextResponse.json({ error: 'A valid date is required' }, { status: 400 });
    }
    if (body && (typeof body !== 'string' || body.length > 1000)) {
      return NextResponse.json({ error: 'Description is too long' }, { status: 400 });
    }
    if (location && (typeof location !== 'string' || location.length > 200)) {
      return NextResponse.json({ error: 'Location is too long' }, { status: 400 });
    }
    if (type === 'photo' && (!Array.isArray(photos) || photos.length === 0)) {
      return NextResponse.json({ error: 'At least one photo is required' }, { status: 400 });
    }

    const memory = await prisma.memory.create({
      data: {
        author,
        type,
        title,
        body: body || null,
        date: new Date(date),
        emoji: emoji || null,
        location: location || null,
        photos: {
          create: (photos ?? []).map((photo: { url: string; order: number }) => ({
            url: photo.url,
            order: photo.order,
          })),
        },
      },
      include: { photos: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json({ ...memory, commentCount: 0, photoCount: memory.photos.length });
  } catch (error) {
    console.error('Error in POST /api/memories:', error);
    return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 });
  }
}

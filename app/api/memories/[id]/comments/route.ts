import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Filter } from 'bad-words';

const filter = new Filter();
const AUTHORS = ['bryan', 'adela'];

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const comments = await prisma.comment.findMany({
      where: { memoryId: params.id },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error in GET /api/memories/[id]/comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { author, body } = await request.json();

    if (!AUTHORS.includes(author)) {
      return NextResponse.json({ error: 'Invalid author' }, { status: 400 });
    }
    if (!body || typeof body !== 'string' || body.length > 500) {
      return NextResponse.json({ error: 'Comment is required (max 500 chars)' }, { status: 400 });
    }
    if (filter.isProfane(body)) {
      return NextResponse.json({ error: 'Nice try :)' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: { memoryId: params.id, author, body },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error in POST /api/memories/[id]/comments:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}

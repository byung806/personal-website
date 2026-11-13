import { NextResponse } from 'next/server';
import { Filter } from 'bad-words';
import { prisma } from '@/lib/prisma';
import { NAME_MAX, ORNAMENT_KINDS, WISH_MAX } from '@/lib/ornaments';

const filter = new Filter();

/** Every ornament on the /play tree, oldest first (they glow onto the tree in the order they were hung). */
export async function GET() {
  try {
    const ornaments = await prisma.ornament.findMany({ orderBy: { createdAt: 'asc' }, take: 400 });
    return NextResponse.json(ornaments);
  } catch (error) {
    console.error('Error in GET /api/ornaments:', error);
    return NextResponse.json({ error: 'Failed to fetch ornaments' }, { status: 500 });
  }
}

/** Hangs an ornament: who, which one, where on the tree, and an optional wish. */
export async function POST(request: Request) {
  try {
    const { username, wish, kind, height, angle } = await request.json();
    const name = typeof username === 'string' ? username.trim() : '';
    const note = typeof wish === 'string' && wish.trim() ? wish.trim() : null;
    if (!name) return NextResponse.json({ error: 'Put your name on it!' }, { status: 400 });
    if (name.length > NAME_MAX) return NextResponse.json({ error: "That's not your name..." }, { status: 400 });
    if (note && note.length > WISH_MAX) return NextResponse.json({ error: 'Keep the wish short!' }, { status: 400 });
    if (!ORNAMENT_KINDS.includes(kind)) return NextResponse.json({ error: 'Pick an ornament!' }, { status: 400 });
    if (typeof height !== 'number' || !(height >= 0 && height <= 1) || typeof angle !== 'number' || !Number.isFinite(angle)) {
      return NextResponse.json({ error: 'Hang it on the tree!' }, { status: 400 });
    }
    if (filter.isProfane(name) || (note && filter.isProfane(note))) return NextResponse.json({ error: 'Nice try :)' }, { status: 400 });

    const ornament = await prisma.ornament.create({
      data: { username: name, wish: note, kind, height, angle: ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) },
    });
    return NextResponse.json(ornament, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/ornaments:', error);
    return NextResponse.json({ error: 'Failed to hang the ornament' }, { status: 500 });
  }
}

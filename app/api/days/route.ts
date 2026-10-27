import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MAX_SCORE, METERS, MIN_SCORE, averageScore, type Meters } from '@/lib/days';

const SELECT = { date: true, score: true, meters: true, note: true } as const;
const METER_KEYS = new Set<string>(METERS.map((m) => m.key));

// The log is private: reads and writes both need the key from DAYS_KEY.
function authorized(request: Request) {
  const key = process.env.DAYS_KEY;
  return !!key && request.headers.get('x-days-key') === key;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const days = await prisma.day.findMany({ select: SELECT });
    return NextResponse.json(days);
  } catch (error) {
    console.error('Error in GET /api/days:', error);
    return NextResponse.json({ error: 'Failed to fetch days' }, { status: 500 });
  }
}

/** Body: { date, meters?: { [key]: 1..100 }, note?: string }. Meters merge into the day; score is recomputed. */
export async function PUT(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { date, meters, note } = await request.json();
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }
    if (meters !== undefined) {
      const valid = meters && typeof meters === 'object' && Object.entries(meters).every(
        ([k, v]) => METER_KEYS.has(k) && Number.isInteger(v) && (v as number) >= MIN_SCORE && (v as number) <= MAX_SCORE,
      );
      if (!valid) return NextResponse.json({ error: 'Invalid meters' }, { status: 400 });
    }
    if (note !== undefined && (typeof note !== 'string' || note.length > 280)) {
      return NextResponse.json({ error: 'Invalid note' }, { status: 400 });
    }

    const existing = await prisma.day.findUnique({ where: { date }, select: SELECT });
    const merged: Meters = { ...((existing?.meters as Meters) ?? {}), ...(meters ?? {}) };
    const data = {
      meters: merged,
      score: averageScore(merged) ?? existing?.score ?? null,
      note: note === undefined ? existing?.note ?? null : note.trim() || null,
    };
    const day = await prisma.day.upsert({ where: { date }, create: { date, ...data }, update: data, select: SELECT });
    return NextResponse.json(day);
  } catch (error) {
    console.error('Error in PUT /api/days:', error);
    return NextResponse.json({ error: 'Failed to save day' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MAX_SCORE, MIN_SCORE } from '@/lib/days';

// The log is private: reads and writes both need the key from DAYS_KEY.
function authorized(request: Request) {
  const key = process.env.DAYS_KEY;
  return !!key && request.headers.get('x-days-key') === key;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const days = await prisma.day.findMany({ select: { date: true, score: true } });
    return NextResponse.json(days);
  } catch (error) {
    console.error('Error in GET /api/days:', error);
    return NextResponse.json({ error: 'Failed to fetch days' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { date, score } = await request.json();
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }
    if (!Number.isInteger(score) || score < MIN_SCORE || score > MAX_SCORE) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
    }
    const day = await prisma.day.upsert({
      where: { date },
      create: { date, score },
      update: { score },
      select: { date: true, score: true },
    });
    return NextResponse.json(day);
  } catch (error) {
    console.error('Error in PUT /api/days:', error);
    return NextResponse.json({ error: 'Failed to save day' }, { status: 500 });
  }
}

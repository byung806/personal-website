import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const planets = await prisma.planet.findMany({
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
    return NextResponse.json(planets);
  } catch (error) {
    console.error('Error in GET /api/planets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch planets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { drawingData, x, y } = await request.json();

    if (typeof drawingData !== 'string' || !drawingData.startsWith('data:image/png;base64,')) {
      return NextResponse.json(
        { error: 'Drawing must be a PNG image!' },
        { status: 400 }
      );
    }

    const inRange = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 100;
    if (!inRange(x) || !inRange(y)) {
      return NextResponse.json(
        { error: 'Position must be between 0 and 100!' },
        { status: 400 }
      );
    }

    // Limit drawing data size (base64 image shouldn't be too large)
    if (drawingData.length > 100000) {
      return NextResponse.json(
        { error: 'Drawing is too large!' },
        { status: 400 }
      );
    }

    const planet = await prisma.planet.create({
      data: {
        drawingData,
        x,
        y,
      },
    });

    return NextResponse.json(planet, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/planets:', error);
    return NextResponse.json(
      { error: 'Failed to add planet' },
      { status: 500 }
    );
  }
}

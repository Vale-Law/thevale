import { NextResponse } from 'next/server';
import { getAvailability } from '@/lib/availability';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // always compute fresh, never cache

// Public: the client-facing app calls this to show bookable times.
//   GET /api/attorneys/<id>/slots
// Returns ONLY free start times — never anything about what's on the calendar.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { slots, durationMinutes } = await getAvailability(params.id);
  return NextResponse.json({ slots, durationMinutes });
}

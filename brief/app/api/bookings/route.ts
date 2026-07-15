import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAvailability } from '@/lib/availability';
import { googleCreateEvent } from '@/lib/google';
import { outlookCreateEvent } from '@/lib/outlook';

export const runtime = 'nodejs';

// Create a booking.
//   POST /api/bookings
//   body: { attorneyId, clientId?, startAt (ISO), caseSummary? }
//
// Flow: re-verify the slot is STILL free right now → insert (the database's
// no_overlap rule is the final guard against double-booking) → write the event
// to the attorney's real calendar.
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { attorneyId, clientId, startAt, caseSummary } = body;
  if (!attorneyId || !startAt) {
    return NextResponse.json({ error: 'attorneyId and startAt are required' }, { status: 400 });
  }

  // 1) Recompute availability and confirm this exact start time is still open.
  //    This catches a slot that was taken (calendar or another booking) between
  //    the client seeing it and clicking book.
  const { slots, durationMinutes, provider } = await getAvailability(attorneyId);
  const start = new Date(startAt);
  const startISO = start.toISOString();
  if (!slots.includes(startISO)) {
    return NextResponse.json({ error: 'That time was just taken — please pick another.' }, { status: 409 });
  }
  const end = new Date(start.getTime() + durationMinutes * 60_000);

  // 2) Insert. The `no_overlap` exclusion constraint makes two simultaneous
  //    inserts for the same time impossible — the loser gets a DB error, which
  //    we translate to a friendly 409.
  const { data: booking, error } = await supabaseAdmin.from('bookings').insert({
    attorney_id: attorneyId,
    client_id: clientId ?? null,
    start_at: startISO,
    end_at: end.toISOString(),
    status: 'confirmed',
    case_summary: caseSummary ?? null,
  }).select().single();

  if (error || !booking) {
    return NextResponse.json({ error: 'That time was just taken — please pick another.' }, { status: 409 });
  }

  // 3) Write the event onto the attorney's real calendar. The case summary goes
  //    onto THEIR event (the attorney sees it) — it is never exposed to clients.
  try {
    const description = `Brief consultation.\n\nCase summary:\n${
      typeof caseSummary === 'string' ? caseSummary : JSON.stringify(caseSummary ?? {}, null, 2)
    }`;
    let externalId: string | null = null;
    if (provider === 'google') {
      externalId = await googleCreateEvent(attorneyId, { start, end, summary: 'Brief consultation', description });
    } else if (provider === 'microsoft') {
      externalId = await outlookCreateEvent(attorneyId, { start, end, summary: 'Brief consultation', description });
    }
    if (externalId) {
      await supabaseAdmin.from('bookings').update({ external_event_id: externalId }).eq('id', booking.id);
    }
  } catch (e) {
    // The booking is confirmed and double-book-safe regardless; a calendar
    // write failure is logged, not fatal, so we don't lose the client's booking.
    console.error('Calendar event write failed:', e);
  }

  return NextResponse.json({ booking });
}

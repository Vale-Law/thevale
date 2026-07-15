import { NextResponse } from 'next/server';
import { GOOGLE_REDIRECT, GOOGLE_SCOPES } from '@/lib/google';

export const runtime = 'nodejs';

// Step 1 of connecting: send the attorney to Google's consent screen.
// The frontend links here:  /api/calendar/google/connect?attorney_id=<uuid>
export async function GET(req: Request) {
  const attorneyId = new URL(req.url).searchParams.get('attorney_id');
  if (!attorneyId) return NextResponse.json({ error: 'attorney_id is required' }, { status: 400 });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: GOOGLE_REDIRECT(),
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline',   // ask for a refresh token
    prompt: 'consent',        // force a refresh token even on re-connect
    include_granted_scopes: 'true',
    state: attorneyId,        // carried back to us in the callback
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}

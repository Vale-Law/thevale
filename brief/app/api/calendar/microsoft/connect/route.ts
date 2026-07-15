import { NextResponse } from 'next/server';
import { MS_REDIRECT, MS_SCOPES } from '@/lib/outlook';

export const runtime = 'nodejs';

// Step 1 (Microsoft): send the attorney to the Microsoft consent screen.
// Frontend links here:  /api/calendar/microsoft/connect?attorney_id=<uuid>
export async function GET(req: Request) {
  const attorneyId = new URL(req.url).searchParams.get('attorney_id');
  if (!attorneyId) return NextResponse.json({ error: 'attorney_id is required' }, { status: 400 });

  const params = new URLSearchParams({
    client_id: process.env.MS_CLIENT_ID!,
    redirect_uri: MS_REDIRECT(),
    response_type: 'code',
    scope: MS_SCOPES,           // includes offline_access for a refresh token
    response_mode: 'query',
    state: attorneyId,
  });

  return NextResponse.redirect(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`);
}

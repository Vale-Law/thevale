import { NextResponse } from 'next/server';
import { saveGoogleConnectionFromCode, setupGoogleWatch } from '@/lib/google';

export const runtime = 'nodejs';

// Step 2: Google redirects back here with a one-time `code`. We exchange it for
// tokens, store them (encrypted), set up the change-notification watch, then
// send the attorney back to the app.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const attorneyId = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) return NextResponse.redirect(`${process.env.APP_URL}/attorney/calendar?error=${error}`);
  if (!code || !attorneyId) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  try {
    await saveGoogleConnectionFromCode(attorneyId, code);
    // Best-effort: don't fail the connect if the watch can't be set up (e.g. on
    // localhost without a public URL).
    await setupGoogleWatch(attorneyId).catch(() => {});
  } catch (e: any) {
    console.error(e);
    return NextResponse.redirect(`${process.env.APP_URL}/attorney/calendar?error=google_connect_failed`);
  }

  return NextResponse.redirect(`${process.env.APP_URL}/attorney/calendar?connected=google`);
}

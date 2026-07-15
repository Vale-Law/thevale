import { NextResponse } from 'next/server';
import { saveOutlookConnectionFromCode, setupOutlookSubscription } from '@/lib/outlook';

export const runtime = 'nodejs';

// Step 2 (Microsoft): exchange the code for tokens, store them (encrypted), set
// up the change subscription, then return the attorney to the app.
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
    await saveOutlookConnectionFromCode(attorneyId, code);
    await setupOutlookSubscription(attorneyId).catch(() => {});
  } catch (e: any) {
    console.error(e);
    return NextResponse.redirect(`${process.env.APP_URL}/attorney/calendar?error=microsoft_connect_failed`);
  }

  return NextResponse.redirect(`${process.env.APP_URL}/attorney/calendar?connected=microsoft`);
}

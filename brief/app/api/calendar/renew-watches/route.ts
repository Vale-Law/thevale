import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getGoogleToken, setupGoogleWatch } from '@/lib/google';
import { getOutlookToken, setupOutlookSubscription } from '@/lib/outlook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Runs daily (see vercel.json). Vercel automatically sends
// `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set, which we check
// so nobody else can trigger this.
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // allow if unset (e.g. local dev)
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

const RENEW_WITHIN_MS = 2 * 24 * 60 * 60 * 1000; // renew anything expiring within 2 days

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: connections } = await supabaseAdmin
    .from('attorney_calendar_connections')
    .select('attorney_id, provider, channel_id, channel_expires_at');

  const results: Array<{ attorneyId: string; provider: string; action: string }> = [];

  for (const c of connections ?? []) {
    const expiresSoon = !c.channel_expires_at ||
      new Date(c.channel_expires_at).getTime() < Date.now() + RENEW_WITHIN_MS;
    if (!expiresSoon) continue;

    try {
      if (c.provider === 'google') {
        // Refresh the access token if needed, then (re)create the watch channel.
        await getGoogleToken(c.attorney_id);
        await setupGoogleWatch(c.attorney_id);
        results.push({ attorneyId: c.attorney_id, provider: 'google', action: 'rewatched' });
      } else if (c.provider === 'microsoft') {
        const token = await getOutlookToken(c.attorney_id);
        // Try to extend the existing subscription; if that fails, recreate it.
        let extended = false;
        if (token && c.channel_id) {
          const newExp = new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000).toISOString();
          const r = await fetch(`https://graph.microsoft.com/v1.0/subscriptions/${c.channel_id}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ expirationDateTime: newExp }),
          });
          if (r.ok) {
            await supabaseAdmin.from('attorney_calendar_connections')
              .update({ channel_expires_at: newExp })
              .eq('attorney_id', c.attorney_id).eq('provider', 'microsoft');
            extended = true;
          }
        }
        if (!extended) await setupOutlookSubscription(c.attorney_id);
        results.push({ attorneyId: c.attorney_id, provider: 'microsoft', action: extended ? 'extended' : 'recreated' });
      }
    } catch (e: any) {
      results.push({ attorneyId: c.attorney_id, provider: c.provider, action: `error: ${e.message}` });
    }
  }

  return NextResponse.json({ renewed: results.length, results });
}

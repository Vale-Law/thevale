import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Google pings this URL whenever a watched calendar changes. We compute
// availability live on every request, so there is no cache to bust — we just
// acknowledge with 200 so Google keeps the channel healthy. (Hook for future
// caching/notifications goes here.)
export async function POST() {
  return new NextResponse(null, { status: 200 });
}

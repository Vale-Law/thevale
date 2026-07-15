import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Microsoft Graph calls this endpoint in two situations:
//
// 1) Subscription validation: when we first create the subscription, Graph
//    sends a `validationToken` query param and expects us to echo it back as
//    plain text within 10 seconds. If we don't, the subscription is rejected.
//
// 2) Change notifications: afterwards, Graph POSTs a JSON body when the
//    attorney's calendar changes. We compute availability live, so we just
//    acknowledge with 202.
export async function POST(req: Request) {
  const validationToken = new URL(req.url).searchParams.get('validationToken');
  if (validationToken) {
    return new NextResponse(validationToken, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
  // A real change notification — acknowledge quickly.
  return new NextResponse(null, { status: 202 });
}

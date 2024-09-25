// app/api/sse/route.ts

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';

declare global {
  var sseClients: Set<WritableStreamDefaultWriter<any>> | undefined;
}

if (!global.sseClients) {
  global.sseClients = new Set();
}
const clients = global.sseClients;

export async function GET(req: NextRequest) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  clients.add(writer);

  req.signal.addEventListener('abort', () => {
    clients.delete(writer);
    writer.close();
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

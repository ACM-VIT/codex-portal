// app/api/sse/route.ts

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';

declare global {
  // eslint-disable-next-line no-var
  var sseClients: Set<WritableStreamDefaultWriter<any>> | undefined;
}

if (!global.sseClients) {
  global.sseClients = new Set();
}
const clients = global.sseClients;

export async function GET(req: NextRequest) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Add the client writer to the global set
  clients.add(writer);

  // Clean up when the client disconnects
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

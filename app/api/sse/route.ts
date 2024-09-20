// api/sse/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { addClient, removeClient } from '../../../lib/sse';

export async function GET(req: NextRequest) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  return new Response(new ReadableStream({
    start(controller) {
      addClient(controller);

      req.signal.addEventListener('abort', () => {
        removeClient(controller);
      });
    },
  }), { headers });
}
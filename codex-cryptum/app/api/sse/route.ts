// api/sse/route.ts

import { NextResponse } from 'next/server';
import pool from '../../../lib/db'; // Ensure the correct path
import { NextRequest } from 'next/server';

let clients: ReadableStreamDefaultController[] = [];

export async function GET(req: NextRequest) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  return new Response(new ReadableStream({
    start(controller) {
      clients.push(controller);

      // Remove the client when the connection is closed
      req.signal.addEventListener('abort', () => {
        clients = clients.filter(client => client !== controller);
      });
    },
  }), { headers });
}

export function sendToClients(newQuestion: any) {
  clients.forEach((client) => {
    const message = `data: ${JSON.stringify(newQuestion)}\n\n`;
    client.enqueue(new TextEncoder().encode(message));
  });
}

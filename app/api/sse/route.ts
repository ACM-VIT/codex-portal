// app/api/sse/route.ts

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { addClient, removeClient } from '../../../lib/sse';

// This function will be invoked on the GET request
export async function GET(req: NextRequest) {
  // Set the necessary headers for SSE
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  // Create and return a new ReadableStream for the response
  return new Response(
    new ReadableStream({
      start(controller) {
        // Add the controller to manage the client's stream
        addClient(controller);

        // Listen for the 'abort' signal (if the client disconnects)
        req.signal.addEventListener('abort', () => {
          // Remove the client when the request is aborted
          removeClient(controller);
        });
      },
    }),
    { headers }
  );
}

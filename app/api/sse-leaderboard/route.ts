// app/api/sse-leaderboard/route.ts

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';

declare global {
  // eslint-disable-next-line no-var
  var broadcastLeaderboard: (() => Promise<void>) | undefined;
  // eslint-disable-next-line no-var
  var leaderboardInterval: NodeJS.Timeout | undefined;
}

let clients: Array<WritableStreamDefaultWriter<any>> = [];

if (!global.broadcastLeaderboard) {
  global.broadcastLeaderboard = async () => {
    let client;
    try {
      client = await pool.connect();

      const res = await client.query(
        'SELECT user_name, points FROM leaderboard ORDER BY points DESC LIMIT 10'
      );
      const data = res.rows;
      const payload = `data: ${JSON.stringify(data)}\n\n`;

      // Send the leaderboard update to all connected clients
      clients.forEach((client) => {
        client.write(payload);
      });
    } catch (error) {
      console.error('Error broadcasting leaderboard data:', error);
    } finally {
      if (client) {
        client.release();
      }
    }
  };

  // Start the interval only once
  global.leaderboardInterval = setInterval(global.broadcastLeaderboard, 5000);
}

export async function GET(request: NextRequest) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Store the client writer so we can send updates later
  clients.push(writer);

  // Clean up when the client disconnects
  request.signal.addEventListener('abort', () => {
    clients = clients.filter((client) => client !== writer);
    writer.close();
  });

  // Initial response
  return new NextResponse(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

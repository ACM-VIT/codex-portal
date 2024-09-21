export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';

declare global {
  var broadcastLeaderboard: (() => Promise<void>) | undefined;
  var leaderboardInterval: NodeJS.Timeout | undefined;
}

let clients: Array<WritableStreamDefaultWriter<any>> = [];

// Function to broadcast leaderboard data to all clients
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

      console.log("Broadcasting leaderboard data:", payload); // Debug log

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

  // Start the interval to broadcast leaderboard updates
  global.leaderboardInterval = setInterval(global.broadcastLeaderboard, 5000);
}

export async function GET(request: NextRequest) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Store the client writer to send updates later
  clients.push(writer);

  console.log("New client connected. Total clients:", clients.length); // Debug log

  // Clean up when the client disconnects
  request.signal.addEventListener('abort', () => {
    clients = clients.filter((client) => client !== writer);
    writer.close();
    console.log("Client disconnected. Total clients:", clients.length); // Debug log
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

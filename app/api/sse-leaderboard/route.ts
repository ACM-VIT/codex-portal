// app/api/sse-leaderboard/route.ts

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';

declare global {
  var leaderboardData: any[];
  var leaderboardClients: Set<WritableStreamDefaultWriter<any>>;
  var leaderboardUpdating: boolean;
  var leaderboardInterval: NodeJS.Timeout | undefined;
}

if (!globalThis.leaderboardClients) {
  globalThis.leaderboardClients = new Set();
}

if (!globalThis.leaderboardData) {
  globalThis.leaderboardData = [];
}

if (typeof globalThis.leaderboardUpdating !== 'boolean') {
  globalThis.leaderboardUpdating = false;
}

async function updateLeaderboardData() {
  if (globalThis.leaderboardUpdating) return;
  globalThis.leaderboardUpdating = true;

  try {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'SELECT user_name, points FROM leaderboard ORDER BY points DESC LIMIT 10'
      );
      globalThis.leaderboardData = res.rows;
      const payload = `data: ${JSON.stringify(globalThis.leaderboardData)}\n\n`;

      console.log('Broadcasting leaderboard data:', payload);

      globalThis.leaderboardClients.forEach((clientWriter) => {
        clientWriter.write(payload);
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating leaderboard data:', error);
  } finally {
    globalThis.leaderboardUpdating = false;
  }
}

if (!globalThis.leaderboardInterval) {
  globalThis.leaderboardInterval = setInterval(updateLeaderboardData, 5000);
}

export async function GET(request: NextRequest) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Send initial data if available
  if (globalThis.leaderboardData.length > 0) {
    const payload = `data: ${JSON.stringify(globalThis.leaderboardData)}\n\n`;
    writer.write(payload);
  }

  globalThis.leaderboardClients.add(writer);
  console.log(
    'New client connected. Total clients:',
    globalThis.leaderboardClients.size
  );

  request.signal.addEventListener('abort', () => {
    globalThis.leaderboardClients.delete(writer);
    writer.close();
    console.log(
      'Client disconnected. Total clients:',
      globalThis.leaderboardClients.size
    );
  });

  return new NextResponse(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

// app/api/sse-leaderboard/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '@lib/db'; // Using absolute import

console.log('Database Pool:', pool); // Debugging log

export async function GET(request: NextRequest) {
  // Create a TransformStream to handle the SSE response
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Function to fetch and send leaderboard data
  const sendLeaderboard = async () => {
    try {
      const res = await pool.query('SELECT user_name AS nickname, points FROM leaderboard ORDER BY points DESC LIMIT 10');
      const data = res.rows;
      const payload = `data: ${JSON.stringify(data)}\n\n`;
      writer.write(payload);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      const payload = `data: ${JSON.stringify({ error: 'Failed to fetch leaderboard data.' })}\n\n`;
      writer.write(payload);
    }
  };

  // Initial fetch
  await sendLeaderboard();

  // Set up interval to fetch data every 5 seconds
  const interval = setInterval(sendLeaderboard, 5000);

  // Cleanup on client disconnect
  request.signal.addEventListener('abort', () => {
    clearInterval(interval);
    writer.close();
  });

  return new NextResponse(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

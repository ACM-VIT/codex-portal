// app/api/admin/users/stream.ts

import pool from '../../../../lib/db';
import { NextRequest, NextResponse } from 'next/server';

let clients: Response[] = []; // Array to hold connected clients

export async function GET(request: NextRequest) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  };

  const stream = new ReadableStream({
    start(controller) {
      clients.push(new Response(controller));

      // Send initial comment to establish the connection
      controller.enqueue(`: Connected\n\n`);

      console.log(`Client connected. Total clients: ${clients.length}`);

      // Remove client on disconnect
      request.signal.addEventListener('abort', () => {
        clients = clients.filter((client) => client !== new Response(controller));
        controller.close();
        console.log(`Client disconnected. Total clients: ${clients.length}`);
      });
    },
  });

  return new NextResponse(stream, { headers });
}

// Function to send updates to all connected clients
export async function sendUserStatusUpdate() {
  try {
    const query = `
      SELECT 
        u.id AS user_id,
        u.username,
        COUNT(cc.challenge_id) AS total_challenges,
        COUNT(uc.challenge_id) AS completed_challenges,
        CASE 
          WHEN COUNT(cc.challenge_id) = 0 THEN 0
          ELSE ROUND((COUNT(uc.challenge_id)::DECIMAL / COUNT(cc.challenge_id)) * 100, 2)
        END AS completion_percentage
      FROM users u
      LEFT JOIN completed_challenges cc ON u.id = cc.user_id
      LEFT JOIN user_challenge_completions uc ON u.id = uc.user_id AND uc.completed = true
      GROUP BY u.id, u.username
      ORDER BY completion_percentage DESC;
    `;

    const result = await pool.query(query);
    const userStatuses: UserStatus[] = result.rows;

    const data = `data: ${JSON.stringify(userStatuses)}\n\n`;

    clients.forEach((client) => {
      client.body?.write(data);
    });
  } catch (error) {
    console.error('Error sending user status update:', error);
    const errorData = `data: ${JSON.stringify({ error: 'Failed to fetch user statuses.' })}\n\n`;
    clients.forEach((client) => {
      client.body?.write(errorData);
    });
  }
}

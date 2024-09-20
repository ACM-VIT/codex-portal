// app/api/admin/users/route.ts

import pool from '../../../../lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface UserStatus {
  user_id: string;
  username: string;
  total_challenges: number;
  completed_challenges: number;
  completion_percentage: number;
}

export async function GET(request: NextRequest) {
  try {
    // Query to fetch user statuses
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

    return NextResponse.json(userStatuses);
  } catch (error) {
    console.error('Error fetching user statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statuses' },
      { status: 500 }
    );
  }
}

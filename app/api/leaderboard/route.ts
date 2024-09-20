// api/leaderboard/route.ts

import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT user_name AS nickname, points FROM leaderboard ORDER BY points DESC');
    
    console.log('Leaderboard Data:', result.rows);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return NextResponse.json([], { status: 500 });
  }
}

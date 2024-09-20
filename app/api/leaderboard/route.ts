// api/leaderboard/route.ts

import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET() {
  try {
    // Ensure you're selecting the correct fields. Adjust if necessary.
    const result = await pool.query('SELECT user_name, points FROM leaderboard ORDER BY points DESC');
    
    // Log the result for debugging purposes
    console.log('Leaderboard Data:', result.rows);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    // Return an empty array to prevent frontend errors
    return NextResponse.json([], { status: 500 });
  }
}

// app/api/submissions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth'; 

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.name) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Optional: Check if the user has admin privileges
    // if (!session.user.isAdmin) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const client = await pool.connect();

    const result = await client.query(
      `
      SELECT 
        s.id::TEXT, 
        s.user_name AS "userName", 
        q.name AS "questionName", 
        CASE WHEN s.correct THEN 'Completed' ELSE 'Failed' END AS status, 
        s.submitted_at AS timestamp
      FROM submissions s
      JOIN questions q ON s.question_id = q.id
      ORDER BY s.submitted_at DESC
      `
    );

    client.release();

    const submissions = result.rows;

    return NextResponse.json(submissions, { status: 200 });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions.' },
      { status: 500 }
    );
  }
}

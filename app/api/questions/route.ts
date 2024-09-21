// app/api/questions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db'; // Ensure your DB pool is properly set up

// Handle GET and POST requests
export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM questions');
    client.release();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { questionName, description, difficulty, answer } = body;

  if (!questionName || !description || !difficulty || !answer) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO questions (name, description, difficulty, answer) VALUES ($1, $2, $3, $4) RETURNING *`,
      [questionName, description, difficulty, answer]
    );
    client.release();

    return NextResponse.json({ question: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error inserting question:', error);
    return NextResponse.json({ error: 'Failed to insert question.' }, { status: 500 });
  }
}

// app/api/questions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { Question } from '../../../lib/types'; // Import the Question interface

// Handle GET and POST requests
export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM questions');
    client.release();

    // Ensure 'difficulty' is one of the allowed values
    const questions: Question[] = result.rows.map((q) => ({
      id: q.id.toString(), // Assuming 'id' is a number in DB
      name: q.name,
      description: q.description,
      difficulty: q.difficulty as 'easy' | 'medium' | 'hard', // Type assertion
      completed: q.completed,
    }));

    return NextResponse.json(questions, { status: 200 });
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

  // Validate 'difficulty' value
  if (!['easy', 'medium', 'hard'].includes(difficulty.toLowerCase())) {
    return NextResponse.json({ error: 'Invalid difficulty level.' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO questions (name, description, difficulty, answer) VALUES ($1, $2, $3, $4) RETURNING *`,
      [questionName, description, difficulty.toLowerCase(), answer]
    );
    client.release();

    // Return the inserted question adhering to the Question interface
    const newQuestion: Question = {
      id: result.rows[0].id.toString(),
      name: result.rows[0].name,
      description: result.rows[0].description,
      difficulty: result.rows[0].difficulty as 'easy' | 'medium' | 'hard',
      completed: false, // New questions are not completed by default
    };

    return NextResponse.json({ question: newQuestion }, { status: 201 });
  } catch (error) {
    console.error('Error inserting question:', error);
    return NextResponse.json({ error: 'Failed to insert question.' }, { status: 500 });
  }
}

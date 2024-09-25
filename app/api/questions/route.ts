// app/api/questions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { Question } from '../../../lib/types';
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

    const userName = session.user.name;

    const client = await pool.connect();

    const result = await client.query(
      `
      SELECT 
        q.id, 
        q.name, 
        q.description, 
        q.difficulty, 
        COALESCE(uc.completed, false) AS completed
      FROM questions q
      LEFT JOIN user_challenge_completions uc
        ON q.id = uc.question_id AND uc.user_name = $1
      ORDER BY q.id ASC
      `,
      [userName]
    );

    client.release();

    const questions: Question[] = result.rows.map((q) => ({
      id: q.id.toString(), 
      name: q.name,
      description: q.description,
      difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
      completed: q.completed,
    }));

    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { questionName, description, difficulty, answer } = body;

  if (!questionName || !description || !difficulty || !answer) {
    return NextResponse.json(
      { error: 'All fields are required.' },
      { status: 400 }
    );
  }

  if (!['easy', 'medium', 'hard'].includes(difficulty.toLowerCase())) {
    return NextResponse.json(
      { error: 'Invalid difficulty level.' },
      { status: 400 }
    );
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO questions (name, description, difficulty, answer) VALUES ($1, $2, $3, $4) RETURNING *`,
      [questionName, description, difficulty.toLowerCase(), answer]
    );
    client.release();

    const newQuestion: Question = {
      id: result.rows[0].id.toString(), 
      name: result.rows[0].name,
      description: result.rows[0].description,
      difficulty: result.rows[0].difficulty as
        | 'easy'
        | 'medium'
        | 'hard',
      completed: false, 
    };

    return NextResponse.json({ question: newQuestion }, { status: 201 });
  } catch (error) {
    console.error('Error inserting question:', error);
    return NextResponse.json(
      { error: 'Failed to insert question.' },
      { status: 500 }
    );
  }
}

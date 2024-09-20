import pool from '../../../lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { questionId, userAnswer, userName } = await req.json();

  try {
    const result = await pool.query('SELECT answer FROM questions WHERE id = $1', [questionId]);
    const correctAnswer = result.rows[0]?.answer;

    if (correctAnswer && correctAnswer.toLowerCase() === userAnswer.toLowerCase()) {
      await pool.query(
        'INSERT INTO user_challenge_completions (user_name, question_id, completed) VALUES ($1, $2, $3) ON CONFLICT (user_name, question_id) DO UPDATE SET completed = $3',
        [userName, questionId, true]
      );

      await pool.query(
        'INSERT INTO leaderboard (user_name, points) VALUES ($1, $2) ON CONFLICT (user_name) DO UPDATE SET points = leaderboard.points + $2',
        [userName, 10]
      );

      return NextResponse.json({ message: 'Correct answer', completed: true });
    } else {
      return NextResponse.json({ message: 'Incorrect answer', completed: false }, { status: 400 });
    }
  } catch (error) {
    console.error('Error checking answer:', error);
    return NextResponse.json({ message: 'Failed to check answer', error }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userName = session.user?.name;
  const { questionId, userAnswer } = await req.json();

  try {
    const userExistsResult = await pool.query(
      'SELECT * FROM leaderboard WHERE user_name = $1',
      [userName]
    );

    if (userExistsResult.rows.length === 0) {
      await pool.query(
        'INSERT INTO leaderboard (user_name, points) VALUES ($1, $2)',
        [userName, 0]
      );
    }

    const questionResult = await pool.query(
      'SELECT answer FROM questions WHERE id = $1',
      [questionId]
    );

    if (questionResult.rows.length === 0) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    const correctAnswer = questionResult.rows[0].answer;

    if (correctAnswer && correctAnswer.toLowerCase() === userAnswer.toLowerCase()) {
      await pool.query(
        'INSERT INTO user_challenge_completions (user_name, question_id, completed) VALUES ($1, $2, $3) ON CONFLICT (user_name, question_id) DO UPDATE SET completed = $3',
        [userName, questionId, true]
      );

      await pool.query(
        'UPDATE leaderboard SET points = points + $1 WHERE user_name = $2',
        [10, userName]
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

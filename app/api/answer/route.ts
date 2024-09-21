// app/api/answer/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { getToken } from 'next-auth/jwt';
import { Question } from '../../../lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userName = token.name;  // Retrieve the user name from the token
  const { questionId, userAnswer } = await req.json();

  if (!questionId || !userAnswer) {
    return NextResponse.json({ message: 'Missing questionId or userAnswer.' }, { status: 400 });
  }

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if user has already completed the challenge
      const completionCheck = await client.query(
        'SELECT completed FROM user_challenge_completions WHERE user_name = $1 AND question_id = $2',
        [userName, questionId]
      );

      if (completionCheck.rows.length > 0 && completionCheck.rows[0].completed) {
        await client.query('ROLLBACK');
        client.release();
        return NextResponse.json({ message: 'Challenge already completed.' }, { status: 400 });
      }

      // Fetch the correct answer and difficulty
      const questionResult = await client.query(
        'SELECT answer, difficulty FROM questions WHERE id = $1',
        [questionId]
      );

      if (questionResult.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        return NextResponse.json({ message: 'Question not found' }, { status: 404 });
      }

      const correctAnswer = questionResult.rows[0].answer;
      const difficulty: 'easy' | 'medium' | 'hard' = questionResult.rows[0].difficulty;

      if (correctAnswer && correctAnswer.toLowerCase() === userAnswer.toLowerCase()) {
        // Determine points based on difficulty
        let pointsToAdd = 10;
        if (difficulty === 'medium') pointsToAdd = 30;
        else if (difficulty === 'hard') pointsToAdd = 50;

        // Insert or update the completion record
        await client.query(
          'INSERT INTO user_challenge_completions (user_name, question_id, completed) VALUES ($1, $2, $3) ON CONFLICT (user_name, question_id) DO UPDATE SET completed = $3',
          [userName, questionId, true]
        );

        // Update the leaderboard
        await client.query(
          'UPDATE leaderboard SET points = points + $1 WHERE user_name = $2',
          [pointsToAdd, userName]
        );

        await client.query('COMMIT');
        client.release();

        return NextResponse.json({ message: 'Correct answer', completed: true }, { status: 200 });
      } else {
        await client.query('ROLLBACK');
        client.release();
        return NextResponse.json({ message: 'Incorrect answer', completed: false }, { status: 400 });
      }
    } catch (err) {
      await client.query('ROLLBACK');
      client.release();
      console.error('Error during transaction:', err);
      return NextResponse.json({ message: 'Failed to check answer', error: err }, { status: 500 });
    }
  } catch (err) {
    console.error('Database connection error:', err);
    return NextResponse.json({ message: 'Database connection error.' }, { status: 500 });
  }
}

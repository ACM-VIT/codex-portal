// app/api/answer/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth'; // Adjust the import path as needed

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.name) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { questionId, userAnswer } = await request.json();

    if (!questionId || !userAnswer) {
      return NextResponse.json(
        { error: 'Question ID and answer are required.' },
        { status: 400 }
      );
    }

    // Parse questionId to integer
    const questionIdInt = parseInt(questionId, 10);
    if (isNaN(questionIdInt)) {
      return NextResponse.json(
        { error: 'Invalid question ID.' },
        { status: 400 }
      );
    }

    const userName = session.user.name;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Fetch the correct answer
      const questionResult = await client.query(
        'SELECT answer FROM questions WHERE id = $1',
        [questionIdInt]
      );

      if (questionResult.rowCount === 0) {
        await client.query('ROLLBACK');
        client.release();
        return NextResponse.json(
          { error: 'Question not found.' },
          { status: 404 }
        );
      }

      const correctAnswer = questionResult.rows[0].answer;

      // Check if the answer is correct
      const isCorrect =
        userAnswer.trim().toLowerCase() ===
        correctAnswer.trim().toLowerCase();

      // Record the submission
      await client.query(
        `INSERT INTO submissions (user_name, question_id, correct)
         VALUES ($1, $2, $3)`,
        [userName, questionIdInt, isCorrect]
      );

      if (isCorrect) {
        // Update user_challenge_completions if the answer is correct
        await client.query(
          `INSERT INTO user_challenge_completions (user_name, question_id, completed)
           VALUES ($1, $2, true)
           ON CONFLICT (user_name, question_id) DO NOTHING`,
          [userName, questionIdInt]
        );

        // Update leaderboard
        await client.query(
          `INSERT INTO leaderboard (user_name, points)
           VALUES ($1, 30)
           ON CONFLICT (user_name)
           DO UPDATE SET points = leaderboard.points + 30`,
          [userName]
        );
      }

      await client.query('COMMIT');
      client.release();

      if (isCorrect) {
        return NextResponse.json(
          { message: 'Correct answer!' },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: 'Incorrect answer.' },
          { status: 400 }
        );
      }
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      console.error('Error during answer submission:', error);
      return NextResponse.json(
        { error: 'Failed to process the answer.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in answer API:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

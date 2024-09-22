// app/api/answer/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

/**
 * Escapes special characters in a string to be used in a RegExp.
 * @param string The string to escape.
 * @returns The escaped string.
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes all regex special characters
}

export async function POST(request: NextRequest) {
  try {
    // Log incoming request
    console.log('Received request to answer route');

    // Authenticate the user
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.name) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`User authenticated: ${session.user.name}`);

    // Extract and validate request body
    const { questionId, userAnswer } = await request.json();
    console.log(`Received questionId: ${questionId}, userAnswer: ${userAnswer}`);

    if (!questionId || !userAnswer) {
      console.log('Missing question ID or answer in the request');
      return NextResponse.json(
        { error: 'Question ID and answer are required.' },
        { status: 400 }
      );
    }

    const questionIdInt = parseInt(questionId, 10);
    if (isNaN(questionIdInt)) {
      console.log('Invalid question ID format');
      return NextResponse.json({ error: 'Invalid question ID.' }, { status: 400 });
    }

    const userName = session.user.name;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Fetch the question's answer and must_include from the database
      const questionResult = await client.query(
        'SELECT answer, must_include FROM questions WHERE id = $1',
        [questionIdInt]
      );

      if (questionResult.rowCount === 0) {
        console.log('Question not found in the database');
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Question not found.' }, { status: 404 });
      }

      const { answer: correctAnswer, must_include: mustInclude } = questionResult.rows[0];
      console.log(`Question data - mustInclude: ${mustInclude}, correctAnswer: ${correctAnswer}`);

      let isCorrect = false;
      const trimmedUserAnswer = userAnswer.trim();
      console.log(`Trimmed user answer: ${trimmedUserAnswer}`);

      if (mustInclude) {
        // Escape any special characters in the mustInclude string
        const escapedMustInclude = escapeRegExp(mustInclude.trim());
        console.log(`Escaped mustInclude: ${escapedMustInclude}`);

        if (correctAnswer) {
          // Combine mustInclude and answer into a single regex
          const fullPattern = `^${escapedMustInclude}${correctAnswer}$`;
          console.log(`Generated regex pattern: ${fullPattern}`);

          try {
            const regex = new RegExp(fullPattern);
            isCorrect = regex.test(trimmedUserAnswer);
            console.log(`Regex test result: ${isCorrect}`);
          } catch (err) {
            console.error('Invalid regex pattern:', err);
            await client.query('ROLLBACK');
            return NextResponse.json(
              { error: 'Invalid regex pattern in the answer.' },
              { status: 500 }
            );
          }
        } else {
          // Only validate against mustInclude if no regex answer is provided
          isCorrect = trimmedUserAnswer.startsWith(mustInclude.trim());
          console.log(`mustInclude match result: ${isCorrect}`);
        }
      } else if (correctAnswer) {
        // Validate only with the regex answer
        try {
          const regex = new RegExp(`^${correctAnswer}$`);
          isCorrect = regex.test(trimmedUserAnswer);
          console.log(`Regex match result (only answer): ${isCorrect}`);
        } catch (err) {
          console.error('Invalid regex pattern:', err);
          await client.query('ROLLBACK');
          return NextResponse.json(
            { error: 'Invalid regex pattern in the answer.' },
            { status: 500 }
          );
        }
      } else {
        // No valid answer or mustInclude found
        console.log('No valid answer or mustInclude found');
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'No valid answer to check against.' },
          { status: 500 }
        );
      }

      const correctValue = isCorrect ? true : false;
      console.log(`Answer correctness: ${correctValue}`);

      // Record the submission in the database
      await client.query(
        `INSERT INTO submissions (user_name, question_id, correct)
         VALUES ($1, $2, $3)`,
        [userName, questionIdInt, correctValue]
      );

      if (correctValue) {
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

      if (correctValue) {
        console.log('Answer correct, submission successful');
        return NextResponse.json({ message: 'Correct answer!' }, { status: 200 });
      } else {
        console.log('Answer incorrect');
        return NextResponse.json({ error: 'Incorrect answer.' }, { status: 400 });
      }
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during answer submission:', error);
      return NextResponse.json(
        { error: 'Failed to process the answer.' },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in answer API:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// app/api/questions/[id]/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  // Validate that the ID is a positive integer using regex
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid question ID format. ID must be a positive integer.' }, { status: 400 });
  }

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if the question exists in user challenge completions
      const challengeCompletionCheck = await client.query(
        'SELECT 1 FROM user_challenge_completions WHERE question_id = $1',
        [id]
      );

      // Ensure rowCount exists and is greater than 0 before proceeding
      if (challengeCompletionCheck?.rowCount && challengeCompletionCheck.rowCount > 0) {
        await client.query('DELETE FROM user_challenge_completions WHERE question_id = $1', [id]);
      }

      // Delete the question from the questions table
      const questionDeletion = await client.query(
        'DELETE FROM questions WHERE id = $1 RETURNING *',
        [id]
      );

      // If no rows were deleted, the question doesn't exist
      if (questionDeletion.rowCount === 0) {
        await client.query('ROLLBACK');
        client.release();
        return NextResponse.json({ error: 'Question not found.' }, { status: 404 });
      }

      await client.query('COMMIT');
      client.release();

      return NextResponse.json({ message: 'Question deleted successfully.' }, { status: 200 });
    } catch (err) {
      await client.query('ROLLBACK');
      client.release();
      console.error('Error during deletion:', err);
      return NextResponse.json({ error: 'Failed to delete question. An error occurred during the transaction.' }, { status: 500 });
    }
  } catch (err) {
    console.error('Database connection error:', err);
    return NextResponse.json({ error: 'Database connection error.' }, { status: 500 });
  }
}

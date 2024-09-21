// app/api/questions/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth'; // Adjust the import path as needed

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      { error: 'Invalid question ID format. ID must be a positive integer.' },
      { status: 400 }
    );
  }

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.name) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optional: Check if the user has admin privileges
    // if (!session.user.isAdmin) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Delete related entries in user_challenge_completions
      await client.query('DELETE FROM user_challenge_completions WHERE question_id = $1', [id]);

      // Delete the question
      const questionDeletion = await client.query(
        'DELETE FROM questions WHERE id = $1 RETURNING *',
        [parseInt(id, 10)] // Parse 'id' to integer since 'questions.id' is integer
      );

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
      return NextResponse.json(
        { error: 'Failed to delete question. An error occurred during the transaction.' },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('Database connection error:', err);
    return NextResponse.json({ error: 'Database connection error.' }, { status: 500 });
  }
}

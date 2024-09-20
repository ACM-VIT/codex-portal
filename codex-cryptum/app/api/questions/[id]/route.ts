// app/api/questions/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db'; // Adjust the path based on your project structure

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  // Validate the ID (assuming it's an integer)
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid question ID.' }, { status: 400 });
  }

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Delete dependent records in user_challenge_completions
      await client.query('DELETE FROM user_challenge_completions WHERE question_id = $1', [id]);

      // Delete the question
      const res = await client.query('DELETE FROM questions WHERE id = $1 RETURNING *', [id]);

      if (res.rowCount === 0) {
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
      console.error('Error deleting question:', err);
      return NextResponse.json({ error: 'Failed to delete question.' }, { status: 500 });
    }
  } catch (err) {
    console.error('Database connection error:', err);
    return NextResponse.json({ error: 'Database connection error.' }, { status: 500 });
  }
}

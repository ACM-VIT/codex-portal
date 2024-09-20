import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userName = session.user?.name;

  try {
    const questionsResult = await pool.query(
      'SELECT id, name, description, difficulty FROM questions ORDER BY id ASC'
    );
    const questions = questionsResult.rows;

    const completionsResult = await pool.query(
      'SELECT question_id FROM user_challenge_completions WHERE user_name = $1 AND completed = true',
      [userName]
    );
    const completedQuestionIds = completionsResult.rows.map((row) => row.question_id);

    const questionsWithCompletion = questions.map((q) => ({
      ...q,
      completed: completedQuestionIds.includes(q.id),
    }));

    return NextResponse.json(questionsWithCompletion);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ message: 'Failed to fetch questions', error }, { status: 500 });
  }
}
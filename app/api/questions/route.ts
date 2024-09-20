// api/questions/route.ts

import pool from '../../../lib/db'; 
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { questionName, description, difficulty, answer } = await req.json();

  try {
    const query = 'INSERT INTO questions (name, description, difficulty, answer) VALUES ($1, $2, $3, $4) RETURNING id';
    const values = [questionName, description, difficulty, answer];
    const result = await pool.query(query, values);

    const newQuestion = {
      id: result.rows[0].id,
      name: questionName,
      description,
      difficulty,
      answer,
    };

    return NextResponse.json({ message: 'Question added successfully', question: newQuestion });
  } catch (error) {
    console.error('Error inserting question:', error);
    return NextResponse.json({ message: 'Failed to add question', error }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const userName = req.headers.get('x-user-name'); 

  try {
    const questionsResult = await pool.query('SELECT * FROM questions ORDER BY id ASC');
    const questions = questionsResult.rows;

    if (userName) {
      const completionsResult = await pool.query(
        'SELECT question_id FROM user_challenge_completions WHERE user_name = $1 AND completed = true', 
        [userName]
      );
      const completedQuestionIds = completionsResult.rows.map(row => row.question_id);

      const questionsWithCompletion = questions.map(q => ({
        ...q,
        completed: completedQuestionIds.includes(q.id),
      }));

      return NextResponse.json(questionsWithCompletion);
    } else {
      return NextResponse.json(questions);
    }
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ message: 'Failed to fetch questions', error }, { status: 500 });
  }
}

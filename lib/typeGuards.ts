import { Question } from './types';

export function isValidDifficulty(difficulty: any): difficulty is 'easy' | 'medium' | 'hard' {
  return ['easy', 'medium', 'hard'].includes(difficulty);
}

export function isValidQuestion(obj: any): obj is Question {
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    isValidDifficulty(obj.difficulty) &&
    typeof obj.completed === 'boolean'
  );
}
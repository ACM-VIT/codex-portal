export interface Question {
    id: string;
    name: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard'; // Restricting to specific string literals
    completed: boolean;
  }
  
  export interface LeaderboardEntry {
    user_name: string;
    points: number;
  }
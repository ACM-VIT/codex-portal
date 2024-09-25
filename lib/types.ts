export interface Question {
    id: string;
    name: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard'; 
    completed: boolean;
  }
  
  export interface LeaderboardEntry {
    user_name: string;
    points: number;
  }
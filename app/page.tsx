'use client'; // Ensure this is treated as a client component

import { useState, useEffect } from 'react';
import ChallengeTerminal from '../components/ChallengeTerminal';
import Leaderboard from '../components/Leaderboard';
import { useSession, signIn } from 'next-auth/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useSWR from 'swr';
import { fetcher } from '../lib/fetcher';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';

interface LeaderboardEntry {
  user_name: string;
  points: number;
}

interface Question {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  completed: boolean;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const {
    data: questions,
    error: questionsError,
    mutate: mutateQuestions,
  } = useSWR<Question[]>(session ? '/api/questions' : null, fetcher);
  const { data: leaderboard, error: leaderboardError } = useSWR<LeaderboardEntry[]>(
    '/api/leaderboard',
    fetcher
  );

  useEffect(() => {
    if (status === 'loading') {
      // Do nothing while loading
      return;
    }
    if (!session) {
      signIn();
    }
  }, [session, status]);

  const handleChallengeCompletion = (questionId: string) => {
    mutateQuestions(
      (questions) =>
        (questions ?? []).map((q) => (q.id === questionId ? { ...q, completed: true } : q)),
      false
    );
  };

  if (status === 'loading' || !questions || !leaderboard) {
    return <div>Loading...</div>;
  }

  if (questionsError || leaderboardError) {
    return <div>Error loading data.</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-black text-green-500">
      {/* Leaderboard on the left */}
      <div className="w-full lg:w-1/4 flex flex-col border-r border-green-500 p-4 overflow-y-auto">
        <Leaderboard />
      </div>

      {/* Main content area - Center area with challenge */}
      <div className="w-full lg:w-3/4 p-4 flex flex-col">
        <h2 className="text-2xl md:text-3xl mb-4">Select your challenge:</h2>

        {/* Dropdown for question selection */}
        <Select
          onValueChange={(value) =>
            setSelectedQuestion(questions.find((q) => q.id === value) || null)
          }
        >
          <SelectTrigger className="bg-black border border-green-500 p-2 text-lg text-green-500">
            <SelectValue placeholder="Choose a challenge" />
          </SelectTrigger>
          <SelectContent>
            {questions.map((q) => (
              <SelectItem key={q.id} value={q.id}>
                {q.name} {q.completed ? '✓' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Render the challenge terminal */}
        {selectedQuestion ? (
          <ChallengeTerminal
            question={selectedQuestion}
            questions={questions}
            onComplete={handleChallengeCompletion}
            userName={session?.user?.name?.split(' ')[0] || 'Hacker'} // Passing first name of the user
          />
        ) : (
          <div className="bg-black border border-green-500 p-4 rounded-md h-full flex items-center justify-center">
            <p className="text-4xl sm:text-3xl text-center">Select a challenge to begin hacking.</p>
          </div>
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastStyle={{ backgroundColor: 'black', color: 'green' }}
      />
    </div>
  );
}

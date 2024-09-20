'use client'; // Ensure this is treated as a client component

import { useState, useEffect } from 'react';
import Challenge from '../components/Challenge';
import Leaderboard from '../components/Leaderboard';
import { useSession, signIn } from 'next-auth/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useSWR from 'swr';
import { fetcher } from '../lib/fetcher';

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
      // User is not authenticated, redirect to sign-in page
      signIn(); // This will redirect to the sign-in page
    }
  }, [session, status]);

  // Handle Challenge Completion
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
      {/* Sidebar for challenges */}
      <div className="w-full lg:w-1/4 flex flex-col border-r border-green-500 p-4 overflow-y-auto">
        <h2 className="text-2xl md:text-3xl mb-4">Select your challenge:</h2>
        <div className="flex flex-col gap-2">
          {questions.map((q: Question) => (
            <button
              key={q.id}
              onClick={() => setSelectedQuestion(q)}
              className={`bg-black border border-green-500 p-2 text-left text-lg transition ${
                q.completed ? 'bg-green-500 text-black' : 'hover:bg-green-700 hover:text-black'
              }`}
              aria-pressed={q.completed}
            >
              {q.name} {q.completed && '✓'}
            </button>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="w-full lg:w-1/2 p-4 flex flex-col border-x border-green-500">
        {selectedQuestion ? (
          <div className="bg-black border border-green-500 p-6 rounded-md flex flex-col h-full">
            <div className="text-2xl md:text-3xl mb-4">Mission: {selectedQuestion.name}</div>
            <div className="mb-2 text-lg md:text-xl">
              Difficulty: <span className="text-yellow-500 font-semibold">{selectedQuestion.difficulty}</span>
            </div>
            <div className="mb-4 overflow-y-auto max-h-32 sm:max-h-40 md:max-h-48 lg:max-h-56 xl:max-h-64 pr-2">
              <p className="text-base sm:text-lg">{selectedQuestion.description}</p>
            </div>
            <div className="flex-grow"></div>
            <Challenge question={selectedQuestion} onComplete={handleChallengeCompletion} />
          </div>
        ) : (
          <div className="bg-black border border-green-500 p-4 rounded-md h-full flex items-center justify-center">
            <p className="text-4xl sm:text-3xl text-center">Select a challenge to begin hacking.</p>
          </div>
        )}
      </div>

      {/* Leaderboard on the right */}
      <div className="w-full lg:w-1/4 p-4 flex flex-col">
        <Leaderboard />
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
        toastStyle={{ backgroundColor: 'black', color: 'green' }} // Customize the toast background
      />
    </div>
  );
}

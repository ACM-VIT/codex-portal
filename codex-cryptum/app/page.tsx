// page.tsx

'use client';

import { useState, useEffect } from 'react';
import Challenge from '../components/Challenge';
import Leaderboard from '../components/Leaderboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const userName = 'test_user'; // Replace with actual user authentication

  // Fetch Questions
  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions', {
        headers: { 'x-user-name': userName } // Pass userName in headers
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setQuestions(data);
        } else {
          console.error('Questions data is not an array:', data);
          setQuestions([]);
        }
      } else {
        console.error('Failed to fetch questions:', res.statusText);
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    }
  };

  // Fetch Leaderboard
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLeaderboard(data);
        } else {
          console.error('Leaderboard data is not an array:', data);
          setLeaderboard([]);
        }
      } else {
        console.error('Failed to fetch leaderboard:', res.statusText);
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchLeaderboard();

    // Real-time leaderboard using SSE
    const leaderboardSource = new EventSource('/api/sse-leaderboard');
    leaderboardSource.onmessage = (event) => {
      try {
        const updatedLeaderboard = JSON.parse(event.data);
        if (Array.isArray(updatedLeaderboard)) {
          setLeaderboard(updatedLeaderboard);
        } else {
          console.error('Received non-array leaderboard data via SSE:', updatedLeaderboard);
        }
      } catch (error) {
        console.error('Error parsing SSE leaderboard data:', error);
      }
    };

    leaderboardSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      leaderboardSource.close();
    };

    return () => {
      leaderboardSource.close();
    };
  }, []);

  // Handle Challenge Completion
  const handleChallengeCompletion = (questionId: string) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === questionId ? { ...q, completed: true } : q
      )
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-black text-green-500">
      {/* Sidebar for challenges */}
      <div className="w-full lg:w-1/3 flex flex-col border-r border-green-500 p-4 overflow-y-auto">
        <h2 className="text-2xl md:text-3xl mb-4">Select your challenge, hacker:</h2>
        <div className="flex flex-col gap-2">
          {questions.map((q) => (
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

        {/* Leaderboard component */}
        <div className="mt-8">
          <Leaderboard leaderboard={leaderboard} />
        </div>
      </div>

      {/* Main content area */}
      <div className="w-full lg:w-2/3 p-4 flex flex-col">
        {selectedQuestion ? (
          <div className="bg-black border border-green-500 p-6 rounded-md flex flex-col h-full">
            {/* Mission Title */}
            <div className="text-2xl md:text-3xl mb-4">Mission: {selectedQuestion.name}</div>

            {/* Difficulty */}
            <div className="mb-2 text-lg md:text-xl">
              Difficulty: <span className="text-yellow-500 font-semibold">{selectedQuestion.difficulty}</span>
            </div>

            {/* Description */}
            <div className="mb-4 overflow-y-auto max-h-32 sm:max-h-40 md:max-h-48 lg:max-h-56 xl:max-h-64 pr-2">
              <p className="text-base sm:text-lg">{selectedQuestion.description}</p>
            </div>

            {/* Spacer to push the Challenge component to the bottom */}
            <div className="flex-grow"></div>

            {/* Challenge Component */}
            <Challenge
              question={selectedQuestion}
              onComplete={handleChallengeCompletion}
              userName={userName}
            />
          </div>
        ) : (
          <div className="bg-black border border-green-500 p-4 rounded-md h-full flex items-center justify-center">
            <p className="text-4xl sm:text-5xl text-center">Select a challenge to begin hacking.</p>
          </div>
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

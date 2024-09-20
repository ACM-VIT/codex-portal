  'use client';

  export const dynamic = 'force-dynamic';


  import { useState, useEffect } from 'react';
  import Challenge from '../components/Challenge';
  import Leaderboard from '../components/Leaderboard';
  import Modal from '../components/ui/Modal'; // Modal component for nickname input
  import { Input } from '../components/ui/Input';
  import { Button } from '../components/ui/Button';
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
    const [nickname, setNickname] = useState<string>('');
    const [showNicknameModal, setShowNicknameModal] = useState<boolean>(false);

    // Check for nickname in localStorage, otherwise prompt modal
    useEffect(() => {
      const storedNickname = localStorage.getItem('nickname');
      if (!storedNickname) {
        setShowNicknameModal(true);
      } else {
        setNickname(storedNickname);
      }
    }, []);

    // Fetch Questions
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/questions', {
          headers: { 'x-user-name': nickname } // Pass nickname to backend
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
      if (nickname) {
        fetchQuestions();
        fetchLeaderboard();
      }
    }, [nickname]);

    // Handle Challenge Completion
    const handleChallengeCompletion = (questionId: string) => {
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === questionId ? { ...q, completed: true } : q
        )
      );
    };

    // Handle setting nickname and sending it to the server
    const handleSetNickname = async () => {
      if (nickname.trim() === '') {
        toast.error('Please enter a valid nickname.');
        return;
      }

      // Save nickname to localStorage
      localStorage.setItem('nickname', nickname);
      setShowNicknameModal(false);

      try {
        // Send nickname to the backend
        await fetch('/api/set-nickname', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nickname })
        });

        toast.success('Nickname set successfully!');
      } catch (error) {
        console.error('Error setting nickname:', error);
        toast.error('Failed to set nickname.');
      }

      // Fetch the questions and leaderboard after setting nickname
      fetchQuestions();
      fetchLeaderboard();
    };

    return (
      <div className="flex flex-col lg:flex-row h-screen bg-black text-green-500">
        {/* Sidebar for challenges */}
        <div className="w-full lg:w-1/4 flex flex-col border-r border-green-500 p-4 overflow-y-auto">
          <h2 className="text-2xl md:text-3xl mb-4">Select your challenge:</h2>
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
              <Challenge
                question={selectedQuestion}
                onComplete={handleChallengeCompletion}
                userName={nickname} // Send the nickname with the challenge
              />
            </div>
          ) : (
            <div className="bg-black border border-green-500 p-4 rounded-md h-full flex items-center justify-center">
              <p className="text-4xl sm:text-3xl text-center">Select a challenge to begin hacking.</p>
            </div>
          )}
        </div>

        {/* Leaderboard on the right */}
        <div className="w-full lg:w-1/4 p-4 flex flex-col">
          <Leaderboard leaderboard={leaderboard} />
        </div>

        {/* Nickname Modal */}
        <Modal isOpen={showNicknameModal} onClose={() => {}}>
          <div className="p-4">
            <h2 className="text-xl font-bold text-green-500 mb-4">Set Your Nickname</h2>
            <Input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              className="bg-black text-green-500 border border-green-500 w-full mb-4"
            />
            <Button className="w-full bg-green-500 text-black" onClick={handleSetNickname}>
              Set Nickname
            </Button>
          </div>
        </Modal>

        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      </div>
    );
  }

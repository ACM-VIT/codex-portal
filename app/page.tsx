"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChallengeTerminal from "../components/ChallengeTerminal";
import Leaderboard from "../components/Leaderboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useSWR from "swr";
import { fetcher } from "../lib/fetcher";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import debounce from "lodash/debounce";
import LoadingScreen from "../components/LoadingScreen";

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
  const router = useRouter();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: questions, error: questionsError, mutate: mutateQuestions } = useSWR<Question[]>(
    "/api/questions", fetcher
  );
  const { data: leaderboard, error: leaderboardError } = useSWR<LeaderboardEntry[]>("/api/leaderboard", fetcher);

  const debouncedHandleValueChange = useCallback(
    debounce((value: string) => {
      const newQuestion = questions?.find((q) => q.id === value) || null;
      if (newQuestion?.id !== selectedQuestion?.id) {
        setSelectedQuestion(newQuestion);
      }
    }, 300),
    [questions, selectedQuestion]
  );

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleChallengeCompletion = (questionId: string) => {
    mutateQuestions(
      (questions) =>
        (questions ?? []).map((q) => (q.id === questionId ? { ...q, completed: true } : q)),
      false
    );
  };

  if (isLoading || status === "loading") {
    return <LoadingScreen duration={1500} onComplete={handleLoadingComplete} />;
  }

  if (!questions || !leaderboard) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-green-500 font-mono">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (questionsError || leaderboardError) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-red-500 font-mono">
        <div className="text-lg">Error loading data.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-black text-green-500">
      <div className="w-full lg:w-1/4 flex flex-col border-r border-green-500 p-4 overflow-y-auto">
        <Leaderboard />
      </div>

      <div className="w-full lg:w-3/4 p-4 flex flex-col">
        <h2 className="text-2xl md:text-3xl mb-4">Codex Cryptum v3.0</h2>

        <Select onValueChange={debouncedHandleValueChange}>
          <SelectTrigger className="bg-black border border-green-500 p-2 text-lg text-green-500">
            <SelectValue placeholder="Select a challenge" />
          </SelectTrigger>
          <SelectContent className="bg-black border border-green-500 max-h-60 overflow-y-auto">
            {questions?.map((q) => (
              <SelectItem key={q.id} value={q.id} className="hover:bg-green-700 text-green-500 p-2 cursor-pointer">
                {q.name} {q.completed ? "✓" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="h-4"></div>

        <div className="flex-grow">
          <ChallengeTerminal
            question={selectedQuestion}
            onComplete={handleChallengeCompletion}
            userName={session?.user?.name?.split(" ")[0] || "Hacker"}
            questions={questions}
          />
        </div>
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
        toastStyle={{ backgroundColor: "black", color: "green" }}
      />
    </div>
  );
}

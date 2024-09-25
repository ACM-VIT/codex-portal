// page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ChallengeTerminal from "../components/ChallengeTerminal";
import Leaderboard from "../components/Leaderboard";
import QuestionsMenu from "../components/QuestionsMenu";
import QuestionBox from "../components/QuestionBox";
import { ToastContainer, toast } from "react-toastify";
import useSWR from "swr";
import { fetcher } from "../lib/fetcher";
import LoadingScreen from "../components/LoadingScreen";
import { Question, LeaderboardEntry } from "../lib/types";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const { data: session, status } = useSession();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const {
    data: questions,
    error: questionsError,
    mutate: mutateQuestions,
  } = useSWR<Question[]>(session ? "/api/questions" : null, fetcher);

  const { data: leaderboard, error: leaderboardError } = useSWR<LeaderboardEntry[]>(
    "/api/leaderboard",
    fetcher
  );

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleChallengeCompletion = (questionId: string) => {
    mutateQuestions(
      (questions) =>
        (questions ?? []).map((q) =>
          q.id === questionId ? { ...q, completed: true } : q
        ),
      false
    );
    // Remove duplicate toast notification
    // toast.success("Challenge completed!");
  };

  const handleAnswerSubmission = async (answer: string) => {
    if (!selectedQuestion) {
      toast.error("No question selected.");
      return;
    }

    if (selectedQuestion.completed) {
      toast.info("You have already completed this challenge.");
      return;
    }

    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          userAnswer: answer,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Correct answer! Challenge completed.");
        handleChallengeCompletion(selectedQuestion.id);
      } else {
        toast.error(data.message || "Incorrect answer.");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("An error occurred while submitting your answer.");
    }
  };

  useEffect(() => {
    if (questions && selectedQuestion) {
      const updatedQuestion = questions.find((q) => q.id === selectedQuestion.id);
      if (updatedQuestion) {
        setSelectedQuestion(updatedQuestion);
      }
    }
  }, [questions, selectedQuestion]);

  useEffect(() => {
    if (session) {
      mutateQuestions();
    }
  }, [session, mutateQuestions]);

  if (isLoading || status === "loading") {
    return <LoadingScreen duration={1500} onComplete={handleLoadingComplete} />;
  }

  if (!questions || !leaderboard) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-green-500 font-mono">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (questionsError || leaderboardError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-red-500 font-mono">
        <div className="text-lg">Error loading data.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-900 text-green-500">
      {/* Left Side: Leaderboard */}
      <div className="w-full lg:w-1/4 flex flex-col border-r border-gray-700 p-4 overflow-y-hidden bg-gray-800">
        <Leaderboard
          currentUserName={session?.user?.name || ""}
        />
      </div>

      {/* Middle: Challenge Terminal or Question Box */}
      <div className="w-full lg:w-1/2 p-4 flex flex-col bg-gray-900">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-green-500">
            Codex Cryptum v3.0
          </h2>
          <Button
            variant="ghost"
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className="text-green-500 text-2xl"
          >
            {isTerminalOpen ? "X" : "+"}
          </Button>
        </div>

        <div className="flex-grow relative">
          {selectedQuestion ? (
            <>
              {isTerminalOpen ? (
                <ChallengeTerminal
                  question={selectedQuestion}
                  onComplete={handleChallengeCompletion}
                  userName={session?.user?.name?.split(" ")[0] || "Hacker"}
                  questions={questions}
                  onClose={() => setIsTerminalOpen(false)}
                />
              ) : (
                <QuestionBox
                  question={selectedQuestion}
                  onSubmitAnswer={handleAnswerSubmission}
                />
              )}
            </>
          ) : (
            <div className="text-center text-gray-400 flex items-center justify-center h-full">
              Select a question to begin.
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Questions Menu */}
      <div className="w-full lg:w-1/4 flex flex-col border-l border-gray-700 p-4 overflow-y-auto bg-gray-800">
        <QuestionsMenu
          questions={questions}
          selectedQuestion={selectedQuestion}
          onSelectQuestion={(question) => {
            setSelectedQuestion(question);
          }}
        />
      </div>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastStyle={{ backgroundColor: "black", color: "green", fontSize: "0.9rem" }}
      />
    </div>
  );
}

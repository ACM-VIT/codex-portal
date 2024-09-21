"use client";

import React, { useState } from "react";
import ChallengeTerminal from "./ChallengeTerminal";
import { Question } from "../lib/types";
import { Button } from "./ui/Button";

interface ChallengeTerminalWrapperProps {
  question: Question | null;
  onComplete: (questionId: string) => void;
  userName: string;
  questions: Question[];
}

export default function ChallengeTerminalWrapper({
  question,
  onComplete,
  userName,
  questions,
}: ChallengeTerminalWrapperProps) {
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  const toggleTerminal = () => {
    setIsTerminalOpen(!isTerminalOpen);
  };

  if (!question) {
    return null;
  }

  return (
    <div className="relative h-full">
      <div className="flex justify-between items-center mb-2">
        <Button
          variant="ghost"
          onClick={toggleTerminal}
          className="text-green-500 text-2xl"
        >
          {isTerminalOpen ? "X" : "+"}
        </Button>
      </div>

      {isTerminalOpen ? (
        <ChallengeTerminal
          question={question}
          onComplete={onComplete}
          userName={userName}
          questions={questions}
          onClose={toggleTerminal}
        />
      ) : (
        <div className="text-green-500 font-mono">
          Terminal closed. Click + to open.
        </div>
      )}
    </div>
  );
}

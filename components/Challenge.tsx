'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import ScrollArea from './ui/ScrollArea';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

interface ChallengeProps {
  question: {
    id: string;
    name: string;
    description: string;
    difficulty: string;
    completed: boolean;
  };
  onComplete: (questionId: string) => void; // Handler to update completion status
}

export default function Challenge({ question, onComplete }: ChallengeProps) {
  const { data: session } = useSession();
  const [userAnswer, setUserAnswer] = useState('');
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTerminalLines([`Codex Cryptum v3.0`]);
    setUserAnswer('');
    setShowResult(false);
  }, [question.id]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const handleSubmit = async () => {
    if (question.completed) return; // Prevent further submission if challenge is already completed

    if (!userAnswer.trim()) {
      setTerminalLines((prev) => [...prev, `> `, 'Please enter an answer.']);
      toast.warning('Please enter an answer.');
      return;
    }

    setTerminalLines((prev) => [...prev, `> ${userAnswer}`, 'Processing...']);

    try {
      const res = await fetch('/api/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: question.id,
          userAnswer,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTerminalLines((prev) => [...prev, 'Access granted.']);
        setShowResult(true);
        onComplete(question.id); // Update completion status in parent
        toast.success('Correct answer! Challenge completed.');
      } else {
        setTerminalLines((prev) => [...prev, 'Access denied.']);
        toast.error('Incorrect answer. Please try again.');
      }
    } catch (error) {
      setTerminalLines((prev) => [...prev, 'Error processing request.']);
      console.error('Error submitting answer:', error);
      toast.error('An error occurred. Please try again later.');
    }

    setUserAnswer('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Card className="w-full bg-black text-green-500 font-mono border-none outline outline-2 outline-green-500">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Terminal Area */}
        <ScrollArea className="flex-grow mb-4 rounded h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80" ref={scrollAreaRef}>
          <div className="p-4 space-y-2">
            {terminalLines.map((line, index) => (
              <div key={index} className="break-all">
                {line}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input and Submit Button */}
        <div className="flex space-x-2">
          <Input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-black text-green-500 border border-green-500 focus:ring-green-500 focus:border-green-500"
            placeholder={question.completed ? 'Challenge Completed' : 'Enter your answer...'}
            disabled={question.completed} // Disable input if challenge is completed
            aria-label={question.completed ? 'Challenge Completed' : 'Enter your answer'}
          />
          <Button onClick={handleSubmit} className="bg-green-500 text-black hover:bg-green-600" disabled={question.completed}>
            Submit
          </Button>
        </div>

        {/* Result Message */}
        {showResult && (
          <div className="mt-4 text-center text-green-500" role="status" aria-live="polite">
            Challenge completed!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

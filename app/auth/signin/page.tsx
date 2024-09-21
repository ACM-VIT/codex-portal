"use client";

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaArrowRight } from 'react-icons/fa';

export default function SignIn() {
  const { status } = useSession();
  const router = useRouter();
  const [command, setCommand] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-green-500 font-mono">
        <pre>Loading...</pre>
      </div>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand();
    } else if (e.key === 'ArrowUp') {
      navigateHistory('up');
    } else if (e.key === 'ArrowDown') {
      navigateHistory('down');
    }
  };

  const navigateHistory = (direction: 'up' | 'down') => {
    if (commandHistory.length === 0) return;

    if (direction === 'up') {
      const newIndex = historyIndex === -1 ? commandHistory.length - 1 : historyIndex - 1;
      if (newIndex >= 0) {
        setCommand(commandHistory[newIndex]);
        setHistoryIndex(newIndex);
      }
    } else if (direction === 'down') {
      const newIndex = historyIndex + 1;
      if (newIndex < commandHistory.length) {
        setCommand(commandHistory[newIndex]);
        setHistoryIndex(newIndex);
      } else {
        setCommand('');
        setHistoryIndex(-1);
      }
    }
  };

  const executeCommand = () => {
    const trimmedCommand = command.trim().toLowerCase();
    setCommandHistory([...commandHistory, command]);
    setHistoryIndex(-1);

    if (trimmedCommand === 'signin') {
      signIn('google'); 
    } else if (trimmedCommand === 'help') {
      setFeedback("Available commands:\n- signin: Sign in to your account\n- help: Show this help message");
    } else {
      setFeedback(`Command not found: ${command}`);
    }

    setCommand('');
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black text-green-500 font-mono px-4">
      <div className="w-full max-w-md p-8 bg-black border border-green-500 rounded">
        <div className="mb-6">
          <pre>Welcome to Codex Cryptum</pre>
        </div>
        <div className="flex items-center mb-4">
          <span className="mr-2">{'>'}</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-grow bg-black text-green-500 focus:outline-none border-none"
            placeholder="Type 'signin' and press Enter"
          />
          <FaArrowRight className="ml-2" />
        </div>
        {feedback && (
          <pre className="whitespace-pre-wrap bg-black text-green-500 p-2 rounded">
            {feedback}
          </pre>
        )}
      </div>
    </div>
  );
}

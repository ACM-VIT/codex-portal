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
      setFeedback(
        "Available commands:\n- signin: Sign in to your account\n- help: Show this help message"
      );
    } else {
      setFeedback(`Command not found: ${command}`);
    }

    setCommand('');
  };

  return (
    <div className="relative h-screen bg-black text-green-500 font-mono overflow-hidden">
      {/* Background circles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="circle-grid">
          {/* Creating grid of animated circles */}
          {[...Array(300)].map((_, i) => (
            <img
              key={i}
              src="/images/cx.png"
              alt="circle"
              className={`circle-animation animation-delay-${Math.floor(i / 20)}`}
              style={{ width: '50px', height: '50px' }}
            />
          ))}
        </div>
      </div>

      {/* Sign-in components */}
      <div className="flex items-center justify-center h-full z-10 relative">
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

      {/* CSS-in-JS Styles */}
      <style jsx>{`
        .circle-grid {
          position: absolute;
          bottom: 0;
          display: flex;
          flex-wrap: wrap;
          width: 100%;
          height: 100%;
          justify-content: center;
          align-items: center;
        }

        .circle-grid img {
          flex: 0 0 50px;
          height: 50px;
          object-fit: cover;
          filter: blur(2px); /* Slight blur to create watermark effect */
        }

        .circle-animation {
          opacity: 0;
          transform: translateY(100vh);
          animation: rise-up 8s ease-in-out forwards; /* Slower animation for a calm effect */
          filter: opacity(40%); /* Set opacity for watermark effect */
        }

        @keyframes rise-up {
          0% {
            opacity: 0;
            transform: translateY(100vh);
          }
          50% {
            opacity: 0.2; /* Keep opacity lower for watermark */
          }
          100% {
            opacity: 0.4; /* Final subtle opacity */
            transform: translateY(0);
          }
        }

        /* Staggered animation delays for each row */
        ${[...Array(20)]
          .map((_, i) => `.animation-delay-${i} { animation-delay: ${i * 0.3}s; }`)
          .join(' ')}
      `}</style>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/Card';
import ScrollArea from './ui/ScrollArea';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { toast } from 'react-toastify';

interface ChallengeProps {
  question?: {
    id: string;
    name: string;
    description: string;
    difficulty: string;
    completed: boolean;
  };
  onComplete: (questionId: string) => void;
  userName: string;
}

export default function ChallengeTerminal({ question, onComplete, userName }: ChallengeProps) {
  const [userInput, setUserInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(true); // Animation flag
  const [showTerminal, setShowTerminal] = useState(false); // Control when to show terminal
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef<string | null>(null); // Track if the terminal has been initialized for the current question

  useEffect(() => {
    // Initialize the terminal after the logo fades in
    if (question?.id && initializedRef.current !== question.id) {
      fadeLogoAndInitialize();
      initializedRef.current = question.id; // Update the initializedRef to the new question ID
    }
  }, [question?.id]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // Function to handle logo fade-in and then initialize terminal
  const fadeLogoAndInitialize = () => {
    setTerminalOutput([]); // Clear terminal
    setIsInitializing(true);
    setShowTerminal(false); // Hide the terminal while the logo fades in

    // Simulate the fade-in of the logo
    setTimeout(() => {
      setTerminalOutput((prev) => [...prev, 'Initializing Codex Cryptum...']);
    }, 1000);

    setTimeout(() => {
      setTerminalOutput((prev) => [...prev, 'Loading modules...']);
    }, 2000);

    setTimeout(() => {
      setTerminalOutput((prev) => [
        ...prev,
        'Session initialized successfully...',
        `Welcome, ${userName}! Type "help" for available commands.`,
        '$ ',
      ]);
      setShowTerminal(true); // Show the terminal after the fade-in
      setIsInitializing(false); // End initialization
    }, 4000); // Show terminal after the logo animation is done
  };

  const handleCommand = async (command: string) => {
    const sanitizedCommand = command.trim().toLowerCase();
    if (isInitializing) return; // Disable inputs during initialization

    switch (sanitizedCommand) {
      case 'help':
        setTerminalOutput((prev) => [
          ...prev,
          'Available commands:',
          '- info: Show challenge info',
          '- answer <your_answer>: Submit your answer',
          '- clear: Clear the terminal',
          '- questions: List all available questions',
          '$ ',
        ]);
        break;
      case 'info':
        if (question) {
          setTerminalOutput((prev) => [
            ...prev,
            `Mission: ${question.name}`,
            `Difficulty: ${question.difficulty}`,
            `Description: ${question.description}`,
            '$ ',
          ]);
        } else {
          setTerminalOutput((prev) => [...prev, 'No mission selected.', '$ ']);
        }
        break;
      case sanitizedCommand.startsWith('answer') && sanitizedCommand:
        const answer = sanitizedCommand.split(' ')[1];
        await submitAnswer(answer);
        break;
      case 'questions':
        await fetchQuestions();
        break;
      case 'clear':
        setTerminalOutput([]);
        setTerminalOutput((prev) => [...prev, '$ ']);
        break;
      default:
        setTerminalOutput((prev) => [
          ...prev,
          `Command not recognized. Type "help" for a list of commands.`,
          '$ ',
        ]);
    }
  };

  // Fetch and display the list of questions
  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions');
      if (res.ok) {
        const questions = await res.json();
        setTerminalOutput((prev) => [
          ...prev,
          'Available Questions:',
          ...questions.map((q: { name: string; difficulty: string }) => `- ${q.name} (${q.difficulty})`),
          '$ ',
        ]);
      } else {
        setTerminalOutput((prev) => [...prev, 'Failed to fetch questions.', '$ ']);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setTerminalOutput((prev) => [...prev, 'Error fetching questions.', '$ ']);
    }
  };

  const submitAnswer = async (answer: string) => {
    setTerminalOutput((prev) => [...prev, `Submitting answer: ${answer}`, 'Processing...']);
    try {
      const res = await fetch('/api/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: question?.id,
          userAnswer: answer,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTerminalOutput((prev) => [...prev, 'Access granted. Challenge completed!', '$ ']);
        onComplete(question?.id || '');
        toast.success('Correct answer! Challenge completed.');
      } else {
        setTerminalOutput((prev) => [...prev, 'Access denied. Incorrect answer. Try again.', '$ ']);
        toast.error('Incorrect answer.');
      }
    } catch (error) {
      setTerminalOutput((prev) => [...prev, 'Error processing request.', '$ ']);
      toast.error('An error occurred.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(userInput);
      setUserInput('');
    }
  };

  return (
    <Card className="w-full h-full bg-black text-green-500 font-mono border-none outline outline-2 outline-green-500">
      <CardContent className="p-6 flex flex-col h-full justify-between">
        {isInitializing ? (
          // Show the logo during the fade-in
          <div className="flex justify-center items-center h-full">
            <img
              src="/images/cx.png"
              alt="Codex Logo"
              className="fade-in w-40 h-40"
              style={{
                animation: 'fadeIn 2s ease-in-out forwards',
                opacity: 0,
              }}
            />
          </div>
        ) : (
          // Show the terminal content after initialization
          showTerminal && (
            <>
              <ScrollArea className="flex-grow mb-4 rounded h-full" ref={scrollAreaRef}>
                <div className="p-4 space-y-2 flex flex-col justify-end">
                  {terminalOutput.map((line, index) => (
                    <div key={index} className="break-all">
                      {line}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="flex space-x-2">
                <span className="text-green-500">$</span>
                <Input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-grow bg-black text-green-500 border border-green-500 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter command..."
                  aria-label="Terminal command input"
                />
                <Button onClick={() => handleCommand(userInput)} className="bg-green-500 text-black hover:bg-green-600">
                  Enter
                </Button>
              </div>
            </>
          )
        )}
      </CardContent>
    </Card>
  );
}

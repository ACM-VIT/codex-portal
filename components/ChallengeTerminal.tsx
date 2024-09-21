"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { toast } from 'react-toastify';
import { Question } from '@/lib/types';
import ScrollArea from '@/components/ui/ScrollArea'; 

interface ChallengeProps {
  question?: Question | null;
  onComplete: (questionId: string) => void;
  userName: string;
  questions: Question[];
  onClose: () => void;
}

export default function ChallengeTerminal({
  question,
  onComplete,
  userName,
  questions,
  onClose,
}: ChallengeProps) {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState(`/home/${userName}`);
  const [previousPath, setPreviousPath] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasStartedRef = useRef(false);
  const isChangingDirectoryRef = useRef(false);
  
  // Function to update the current directory
  const updateDirectory = useCallback(
    (newPath: string) => {
      if (currentPath !== newPath) {
        setPreviousPath(currentPath);
        setCurrentPath(newPath);
      }
    },
    [currentPath]
  );

  const appendToTerminal = useCallback((messages: string[]) => {
    setTerminalOutput((prev) => [...prev, ...messages]);
  }, []);

  const promptString = useCallback(() => `${currentPath}$ `, [currentPath]);

  // Display help information
  const displayHelp = useCallback(() => {
    const helpText = [
      'Available commands:',
      '  help    - Show this help message',
      '  ls      - List directory contents',
      '  cd      - Change directory',
      '  pwd     - Print working directory',
      '  cat     - Display file contents',
      '  clear   - Clear the terminal screen',
      '  info    - Show challenge info',
      '  answer  - Submit your answer',
      '  exit    - Exit the terminal',
    ];
    appendToTerminal(helpText);
  }, [appendToTerminal]);

  // List directory contents
  const listDirectory = useCallback(() => {
    const parts = currentPath.split('/');
    if (parts[3] === 'challenges') {
      if (parts.length === 4) {
        appendToTerminal(['easy', 'medium', 'hard']);
      } else if (parts.length === 5) {
        const difficulty = parts[4];
        const questionNames = questions
          .filter(q => q.difficulty.toLowerCase() === difficulty)
          .map(q => q.name);
        appendToTerminal(questionNames);
      } else if (parts.length === 6) {
        appendToTerminal(['challenge.txt', 'hint.md']);
      }
    } else {
      appendToTerminal(['challenges']);
    }
  }, [currentPath, questions, appendToTerminal]);

  // Change directory
  const changeDirectory = useCallback(
    (dir: string) => {
      if (!dir || dir === '~') {
        updateDirectory(`/home/${userName}`);
        appendToTerminal([`Changed directory to /home/${userName}`]);
        return;
      }

      if (dir === '-') {
        if (previousPath) {
          updateDirectory(previousPath);
          appendToTerminal([`Changed directory to ${previousPath}`]);
        }
        return;
      }

      let newPath;
      if (dir === '..') {
        newPath = currentPath.split('/').slice(0, -1).join('/');
        if (newPath === '') newPath = `/home/${userName}`;
      } else if (dir.startsWith('/')) {
        newPath = dir;
      } else {
        newPath = `${currentPath}/${dir}`;
      }

      const parts = newPath.split('/');
      if (
        parts[1] !== 'home' ||
        parts[2] !== userName ||
        (parts[3] && parts[3] !== 'challenges')
      ) {
        appendToTerminal([`cd: ${dir}: No such file or directory`]);
        return;
      }

      if (parts[3] === 'challenges') {
        if (parts[4] && !['easy', 'medium', 'hard'].includes(parts[4])) {
          appendToTerminal([`cd: ${dir}: No such file or directory`]);
          return;
        }
        if (
          parts[5] &&
          !questions.some(
            q => q.name === parts[5] && q.difficulty.toLowerCase() === parts[4]
          )
        ) {
          appendToTerminal([`cd: ${dir}: No such file or directory`]);
          return;
        }
      }

      if (!isChangingDirectoryRef.current) {
        isChangingDirectoryRef.current = true;
        updateDirectory(newPath);
        appendToTerminal([`Changed directory to ${newPath}`]);
        setTimeout(() => {
          isChangingDirectoryRef.current = false;
        }, 100); // Prevent multiple changes
      }
    },
    [currentPath, userName, questions, appendToTerminal, previousPath, updateDirectory]
  );

  // Print working directory
  const printWorkingDirectory = useCallback(() => {
    appendToTerminal([currentPath]);
  }, [currentPath, appendToTerminal]);

  // Display file contents
  const catFile = useCallback(
    (filename: string) => {
      const parts = currentPath.split('/');
      if (parts.length !== 6 || parts[3] !== 'challenges') {
        appendToTerminal([`cat: ${filename}: No such file or directory`]);
        return;
      }

      const difficulty = parts[4];
      const questionName = parts[5];
      const currentQuestion = questions.find(
        q =>
          q.difficulty.toLowerCase() === difficulty &&
          q.name === questionName
      );

      if (filename === 'challenge.txt' && currentQuestion) {
        appendToTerminal([
          `Mission: ${currentQuestion.name}`,
          `Difficulty: ${currentQuestion.difficulty}`,
          `Description: ${currentQuestion.description}`,
        ]);
      } else if (filename === 'hint.md') {
        appendToTerminal(['No hints available for this challenge.']);
      } else {
        appendToTerminal([`cat: ${filename}: No such file or directory`]);
      }
    },
    [currentPath, questions, appendToTerminal]
  );

  // Clear the terminal
  const clearTerminal = useCallback(() => {
    setTerminalOutput([]);
    appendToTerminal([promptString()]); // Re-append prompt after clearing
  }, [appendToTerminal, promptString]);

  // Display challenge info
  const displayInfo = useCallback(() => {
    if (question) {
      appendToTerminal([
        `Mission: ${question.name}`,
        `Difficulty: ${question.difficulty}`,
        `Description: ${question.description}`,
      ]);
    } else {
      appendToTerminal(['No mission selected.']);
    }
  }, [question, appendToTerminal]);

  // Handle answer submission
  const submitAnswer = useCallback(
    async (answer: string, currentQuestion = question) => {
      if (!currentQuestion) {
        appendToTerminal([
          'No mission selected. Navigate to a challenge directory to submit an answer.',
        ]);
        return;
      }

      appendToTerminal(['Submitting answer...']);
      try {
        const res = await fetch('/api/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            userAnswer: answer,
          }),
        });

        if (res.ok) {
          appendToTerminal(['Access granted. Challenge completed!']);
          onComplete(currentQuestion.id);
          toast.success('Correct answer! Challenge completed.');
        } else {
          appendToTerminal(['Access denied. Incorrect answer. Try again.']);
          toast.error('Incorrect answer.');
        }
      } catch (error) {
        appendToTerminal(['Error processing request.']);
        toast.error('An error occurred.');
      }
    },
    [question, appendToTerminal, onComplete]
  );

  const handleAnswer = useCallback(
    async (args: string[]) => {
      if (currentPath.includes('/challenges')) {
        await submitAnswer(args.join(' '));
      } else if (args.length >= 2) {
        const questionName = args[0];
        const answer = args.slice(1).join(' ');
        const currentQuestion = questions.find(q => q.name === questionName);
        if (currentQuestion) {
          await submitAnswer(answer, currentQuestion);
        } else {
          appendToTerminal([`Question not found: ${questionName}`]);
        }
      } else {
        appendToTerminal(['Invalid answer command format.']);
      }
    },
    [currentPath, questions, appendToTerminal, submitAnswer]
  );

  // Handle command execution
  const handleCommand = useCallback(() => {
    const command = inputValue.trim();
    if (!command) {
      return;
    }

    setCommandHistory(prev => [command, ...prev]);
    setHistoryIndex(-1);
    appendToTerminal([`${promptString()}${command}`]);

    const [cmd, ...args] = command.split(' ');

    switch (cmd.toLowerCase()) {
      case 'help':
        displayHelp();
        break;
      case 'ls':
        listDirectory();
        break;
      case 'cd':
        changeDirectory(args[0]);
        break;
      case 'pwd':
        printWorkingDirectory();
        break;
      case 'cat':
        catFile(args[0]);
        break;
      case 'clear':
        clearTerminal();
        return;
      case 'info':
        displayInfo();
        break;
      case 'answer':
        handleAnswer(args);
        break;
      case 'exit':
        appendToTerminal(['Logout']);
        onComplete(question?.id || '');
        return;
      default:
        appendToTerminal([`${cmd}: command not found`]);
    }

    setInputValue('');
  }, [
    inputValue,
    appendToTerminal,
    promptString,
    displayHelp,
    listDirectory,
    changeDirectory,
    printWorkingDirectory,
    catFile,
    clearTerminal,
    displayInfo,
    handleAnswer,
    onComplete,
    question,
  ]);

  // Handle key events in the input field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = historyIndex === -1 ? 0 : historyIndex + 1;
        if (nextIndex < commandHistory.length) {
          setHistoryIndex(nextIndex);
          setInputValue(commandHistory[nextIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputValue(commandHistory[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInputValue('');
      }
    }
  };

  // Initialize the terminal with startup messages
  const startTerminalSequence = useCallback(() => {
    const startupMessages = [
      "Initializing Codex Cryptum Terminal...",
      "Loading system modules...",
      "Establishing secure connection...",
      "Authentication complete...",
      `Welcome, ${userName}!`,
      'Type "help" for available commands.',
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < startupMessages.length) {
        appendToTerminal([startupMessages[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 500);
  }, [userName, appendToTerminal]);

  // Start the terminal sequence on component mount
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startTerminalSequence();
    }

    return () => {
      isChangingDirectoryRef.current = false;
    };
  }, [startTerminalSequence]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // Update currentPath when a new question is selected
  useEffect(() => {
    if (question) {
      const newPath = `/home/${userName}/challenges/${question.difficulty.toLowerCase()}/${question.name}`;
      if (currentPath !== newPath) {
        updateDirectory(newPath);
        appendToTerminal([`Changed directory to ${newPath}`]);
      }
    }
  }, [question, userName, appendToTerminal, currentPath, updateDirectory]);

  return (
    <Card className="w-full h-full bg-gray-900 text-green-500 font-mono p-4 rounded-lg shadow-lg relative overflow-hidden">
      {/* Watermark */}
      <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
        <img src="/images/cx.png" alt="Watermark" className="max-w-xs" />
      </div>
      <CardContent className="p-2 flex flex-col h-full relative z-10">
        {/* Scrollable terminal output with hidden scrollbar */}
        <ScrollArea className="flex-grow mb-2 scrollbar-hide" ref={scrollAreaRef}>
          <div className="space-y-2">
            {terminalOutput.map((line, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {line}
              </div>
            ))}
          </div>
        </ScrollArea>
        {/* Input area */}
        <div className="flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            ref={inputRef}
            className="bg-transparent text-green-500 p-2 focus:outline-none caret-green-500 flex-grow"
            autoFocus
            autoComplete="off"
            aria-label="Terminal command input"
          />
        </div>
      </CardContent>
    </Card>
  );
}

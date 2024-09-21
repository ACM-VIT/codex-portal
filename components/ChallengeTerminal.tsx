"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { toast } from 'react-toastify';
import { Question } from '@/lib/types';

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
  const hasStartedRef = useRef(false);
  const isChangingDirectoryRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const MAX_TERMINAL_LINES = 19; // Max lines in the terminal output

  // Append new messages to the terminal output, keeping a maximum of 10 lines
  const appendToTerminal = useCallback((messages: string[]) => {
    setTerminalOutput((prev) => {
      const newOutput = [...prev, ...messages];
      return newOutput.slice(-MAX_TERMINAL_LINES); // Keep only the last MAX_TERMINAL_LINES lines
    });
  }, []);

  const promptString = useCallback(() => `$ `, []);

  const updateDirectory = useCallback(
    (newPath: string) => {
      if (currentPath !== newPath) {
        setPreviousPath(currentPath);
        setCurrentPath(newPath);
      }
    },
    [currentPath]
  );

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

  const listDirectory = useCallback(() => {
    const parts = currentPath.split('/');
    if (parts[3] === 'challenges') {
      if (parts.length === 4) {
        appendToTerminal(['easy', 'medium', 'hard']);
      } else if (parts.length === 5) {
        const difficulty = parts[4];
        const questionNames = questions
          .filter((q) => q.difficulty.toLowerCase() === difficulty)
          .map((q) => q.name);
        appendToTerminal(questionNames);
      } else if (parts.length === 6) {
        appendToTerminal(['challenge.txt', 'hint.md']);
      }
    } else {
      appendToTerminal(['challenges']);
    }
  }, [currentPath, questions, appendToTerminal]);

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
            (q) => q.name === parts[5] && q.difficulty.toLowerCase() === parts[4]
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
        }, 100);
      }
    },
    [currentPath, userName, questions, appendToTerminal, previousPath, updateDirectory]
  );

  const printWorkingDirectory = useCallback(() => {
    appendToTerminal([currentPath]);
  }, [currentPath, appendToTerminal]);

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
        (q) =>
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

  const clearTerminal = useCallback(() => {
    setTerminalOutput([]);
  }, []);

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
          const data = await res.json();
          appendToTerminal(['Access denied. Incorrect answer. Try again.']);
          toast.error(data.message || 'Incorrect answer.');
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
        const currentQuestion = questions.find((q) => q.name === questionName);
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

  const handleCommand = useCallback(() => {
    const command = inputValue.trim();
    if (!command) return;

    setCommandHistory((prev) => [command, ...prev]);
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
        onClose();
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
    onClose,
  ]);

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

  const startTerminalSequence = useCallback(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const startupMessages = [
        'Initializing Codex Cryptum Terminal...',
        'Loading system modules...',
        'Establishing secure connection...',
        'Authentication complete...',
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
    }
  }, [userName, appendToTerminal]);

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startTerminalSequence();
    }
  }, [startTerminalSequence]);

  return (
    <Card className="flex flex-col w-full h-full bg-gray-900 text-green-500 font-mono p-4 rounded-lg shadow-lg relative">
      {/* Terminal output area with fixed height and overflow hidden */}
      <div className="flex-grow overflow-hidden h-50"> {/* Fixed height */}
        <div className="flex flex-col justify-end h-full">
          <div className="space-y-2">
            {terminalOutput.map((line, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="flex items-center mt-2">
        <span>{promptString()}</span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent text-green-500 p-2 focus:outline-none caret-green-500 flex-grow"
          autoFocus
          autoComplete="off"
          aria-label="Terminal command input"
        />
      </div>
    </Card>
  );
}

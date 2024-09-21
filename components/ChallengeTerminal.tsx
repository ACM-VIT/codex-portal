'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import ScrollArea from '@/components/ui/ScrollArea'
import { toast } from 'react-toastify'

interface ChallengeProps {
  question?: {
    id: string
    name: string
    description: string
    difficulty: string
    completed: boolean
  } | null
  onComplete: (questionId: string) => void
  userName: string
  questions: {
    id: string
    name: string
    description: string
    difficulty: string
    completed: boolean
  }[]
}

export default function ChallengeTerminal({
  question,
  onComplete,
  userName,
  questions,
}: ChallengeProps) {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [currentPath, setCurrentPath] = useState(`/home/${userName}`)
  const [previousPath, setPreviousPath] = useState('')  // Store the previous path for 'cd -'
  const [inputValue, setInputValue] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasStartedRef = useRef(false)

  const isMountedRef = useRef(true)

  const appendToTerminal = useCallback((messages: string[]) => {
    setTerminalOutput(prev => [...prev, ...messages])
  }, [])

  const promptString = useCallback(() => `${userName}@codex-cryptum:${currentPath}$ `, [userName, currentPath])

  const startTerminalSequence = useCallback(() => {
    const startupMessages = [
      'Initializing Codex Cryptum Terminal...',
      'Loading system modules...',
      'Establishing secure connection...',
      'Authentication complete...',
      `Welcome, ${userName}!`,
      'Type "help" for available commands.',
    ]

    let index = 0
    const interval = setInterval(() => {
      if (index < startupMessages.length) {
        appendToTerminal([startupMessages[index]])
        index++
      } else {
        clearInterval(interval)
      }
    }, 500)
  }, [userName, appendToTerminal])

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      startTerminalSequence()
    }

    return () => {
      isMountedRef.current = false
    }
  }, [startTerminalSequence])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [terminalOutput])

  // Update directory based on input
  const updateDirectory = useCallback((newPath: string) => {
    if (currentPath !== newPath) {
      setPreviousPath(currentPath)  // Store the current path as previous path
      setCurrentPath(newPath)
    }
  }, [currentPath])

  const handleCommand = useCallback(() => {
    const command = inputValue.trim()
    if (!command) {
      return
    }

    setCommandHistory(prev => [command, ...prev])
    setHistoryIndex(-1)
    appendToTerminal([`${promptString()}${command}`])

    const [cmd, ...args] = command.split(' ')

    switch (cmd.toLowerCase()) {
      case 'help':
        displayHelp()
        break
      case 'ls':
        listDirectory()
        break
      case 'cd':
        changeDirectory(args[0])
        break
      case 'pwd':
        printWorkingDirectory()
        break
      case 'cat':
        catFile(args[0])
        break
      case 'clear':
        clearTerminal()
        return
      case 'info':
        displayInfo()
        break
      case 'answer':
        handleAnswer(args)
        break
      case 'exit':
        appendToTerminal(['Logout'])
        return
      default:
        appendToTerminal([`${cmd}: command not found`])
    }

    setInputValue('')
  }, [inputValue, appendToTerminal, promptString])

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
    ]
    appendToTerminal(helpText)
  }, [appendToTerminal])

  const listDirectory = useCallback(() => {
    const parts = currentPath.split('/')
    if (parts[3] === 'challenges') {
      if (parts.length === 4) {
        appendToTerminal(['easy', 'medium', 'hard'])
      } else if (parts.length === 5) {
        const difficulty = parts[4]
        const questionNames = questions
          .filter(q => q.difficulty.toLowerCase() === difficulty)
          .map(q => q.name)
        appendToTerminal(questionNames)
      } else if (parts.length === 6) {
        appendToTerminal(['challenge.txt', 'hint.md'])
      }
    } else {
      appendToTerminal(['challenges'])
    }
  }, [currentPath, questions, appendToTerminal])

  const changeDirectory = useCallback((dir: string) => {
    if (!dir || dir === '~') {
      // Go to home directory
      updateDirectory(`/home/${userName}`)
      return
    }

    if (dir === '-') {
      // Go to previous directory
      if (previousPath) {
        updateDirectory(previousPath)
      }
      return
    }

    let newPath
    if (dir === '..') {
      newPath = currentPath.split('/').slice(0, -1).join('/')
      if (newPath === '') newPath = `/home/${userName}`
    } else if (dir.startsWith('/')) {
      newPath = dir
    } else {
      newPath = `${currentPath}/${dir}`
    }

    const parts = newPath.split('/')
    if (parts[1] !== 'home' || parts[2] !== userName || (parts[3] && parts[3] !== 'challenges')) {
      appendToTerminal([`cd: ${dir}: No such file or directory`])
      return
    }

    if (parts[3] === 'challenges') {
      if (parts[4] && !['easy', 'medium', 'hard'].includes(parts[4])) {
        appendToTerminal([`cd: ${dir}: No such file or directory`])
        return
      }
      if (parts[5] && !questions.some(q => q.name === parts[5] && q.difficulty.toLowerCase() === parts[4])) {
        appendToTerminal([`cd: ${dir}: No such file or directory`])
        return
      }
    }

    updateDirectory(newPath)  // Update without printing "Changed directory"
  }, [currentPath, userName, questions, appendToTerminal, previousPath, updateDirectory])

  const printWorkingDirectory = useCallback(() => {
    appendToTerminal([currentPath])
  }, [currentPath, appendToTerminal])

  const catFile = useCallback((filename: string) => {
    const parts = currentPath.split('/')
    if (parts.length !== 6 || parts[3] !== 'challenges') {
      appendToTerminal([`cat: ${filename}: No such file or directory`])
      return
    }

    const difficulty = parts[4]
    const questionName = parts[5]
    const currentQuestion = questions.find(
      q => q.difficulty.toLowerCase() === difficulty && q.name === questionName
    )

    if (filename === 'challenge.txt' && currentQuestion) {
      appendToTerminal([
        `Mission: ${currentQuestion.name}`,
        `Difficulty: ${currentQuestion.difficulty}`,
        `Description: ${currentQuestion.description}`,
      ])
    } else if (filename === 'hint.md') {
      appendToTerminal(['No hints available for this challenge.'])
    } else {
      appendToTerminal([`cat: ${filename}: No such file or directory`])
    }
  }, [currentPath, questions, appendToTerminal])

  const clearTerminal = useCallback(() => {
    setTerminalOutput([])
    appendToTerminal([promptString()]) // Re-append prompt after clearing
  }, [appendToTerminal, promptString])

  const displayInfo = useCallback(() => {
    if (question) {
      appendToTerminal([
        `Mission: ${question.name}`,
        `Difficulty: ${question.difficulty}`,
        `Description: ${question.description}`,
      ])
    } else {
      appendToTerminal(['No mission selected.'])
    }
  }, [question, appendToTerminal])

  const handleAnswer = useCallback(async (args: string[]) => {
    if (currentPath.includes('/challenges')) {
      await submitAnswer(args.join(' '))
    } else if (args.length >= 2) {
      const questionName = args[0]
      const answer = args.slice(1).join(' ')
      const currentQuestion = questions.find(q => q.name === questionName)
      if (currentQuestion) {
        await submitAnswer(answer, currentQuestion)
      } else {
        appendToTerminal([`Question not found: ${questionName}`])
      }
    } else {
      appendToTerminal(['Invalid answer command format.'])
    }
  }, [currentPath, questions, appendToTerminal])

  const submitAnswer = useCallback(async (
    answer: string,
    currentQuestion = question
  ) => {
    if (!currentQuestion) {
      appendToTerminal([
        'No mission selected. Navigate to a challenge directory to submit an answer.',
      ])
      return
    }

    appendToTerminal(['Submitting answer...'])
    try {
      const res = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          userAnswer: answer,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        appendToTerminal(['Access granted. Challenge completed!'])
        onComplete(currentQuestion.id)
        toast.success('Correct answer! Challenge completed.')
      } else {
        appendToTerminal(['Access denied. Incorrect answer. Try again.'])
        toast.error('Incorrect answer.')
      }
    } catch (error) {
      appendToTerminal(['Error processing request.'])
      toast.error('An error occurred.')
    }
  }, [question, appendToTerminal, onComplete])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCommand()
    }
  }

  return (
    <Card className="w-full h-full bg-black text-green-500 font-mono border-none outline outline-2 outline-green-500">
      <CardContent className="p-6 flex flex-col h-full justify-between">
        <ScrollArea
          className="flex-grow mb-4 rounded h-full"
          ref={scrollAreaRef}
        >
          <div className="p-4 space-y-2 flex flex-col">
            {terminalOutput.map((line, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {line}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex space-x-2">
          <span>{promptString()}</span>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            ref={inputRef}
            className="flex-grow bg-black text-green-500 border-none focus:outline-none caret-green-500"
            autoFocus
            autoComplete="off"
            aria-label="Terminal command input"
          />
        </div>
      </CardContent>
    </Card>
  )
}

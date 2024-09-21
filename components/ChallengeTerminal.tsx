"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import ScrollArea from '@/components/ui/ScrollArea'
import { Input } from '@/components/ui/Input'
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

export default function ChallengeTerminal({ question, onComplete, userName, questions }: ChallengeProps) {
  const [userInput, setUserInput] = useState('')
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [currentPath, setCurrentPath] = useState('/home/' + userName)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  // Ref to track if the terminal sequence has started
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      startTerminalSequence()
    }
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [terminalOutput])

  useEffect(() => {
    if (question) {
      const newPath = `/home/${userName}/challenges/${question.difficulty}/${question.name}`
      setCurrentPath(newPath)
      setTerminalOutput(prev => [...prev, `Changed directory to ${newPath}`, promptString()])
    }
  }, [question, userName])

  const startTerminalSequence = () => {
    const startupMessages = [
      'Initializing Codex Cryptum Terminal...',
      'Loading system modules...',
      'Establishing secure connection...',
      'Authentication complete...',
      `Welcome, ${userName}!`,
      'Type "help" for available commands.',
      ''
    ]

    let index = 0
    const interval = setInterval(() => {
      setTerminalOutput(prev => [...prev, startupMessages[index]])
      index++
      if (index >= startupMessages.length) {
        clearInterval(interval)
        setTerminalOutput(prev => [...prev, promptString()])
      }
    }, 500)
  }

  const promptString = (path: string = currentPath) => `${userName}@codex-cryptum:${path}$ `

  const handleCommand = async (command: string) => {
    if (!command.trim()) {
      // If the user presses Enter without typing a command, just append a new prompt
      setTerminalOutput(prev => [...prev, promptString()])
      return
    }

    const fullCommand = promptString() + command
    setTerminalOutput(prev => [...prev, fullCommand])

    const [cmd, ...args] = command.trim().split(' ')

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
        setTerminalOutput([])
        break
      case 'info':
        displayInfo()
        break
      case 'answer':
        await handleAnswer(args)
        break
      case 'exit':
        setTerminalOutput(prev => [...prev, 'Logout'])
        break
      default:
        setTerminalOutput(prev => [...prev, `${cmd}: command not found`, ''])
    }

    // Append a new prompt after handling the command
    setTerminalOutput(prev => [...prev, promptString()])
  }

  const displayHelp = () => {
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
      '',
    ]
    setTerminalOutput(prev => [...prev, ...helpText])
  }

  const listDirectory = () => {
    const parts = currentPath.split('/')
    if (parts[3] === 'challenges') {
      if (parts.length === 4) {
        setTerminalOutput(prev => [...prev, 'easy', 'medium', 'hard', ''])
      } else if (parts.length === 5) {
        const difficulty = parts[4]
        const questionNames = questions
          .filter(q => q.difficulty.toLowerCase() === difficulty)
          .map(q => q.name)
        setTerminalOutput(prev => [...prev, ...questionNames, ''])
      } else if (parts.length === 6) {
        setTerminalOutput(prev => [...prev, 'challenge.txt', 'hint.md', ''])
      }
    } else {
      setTerminalOutput(prev => [...prev, 'challenges', ''])
    }
  }

  const changeDirectory = (dir: string) => {
    if (!dir) {
      setTerminalOutput(prev => [...prev, 'cd: missing operand', ''])
      return
    }

    let newPath
    if (dir === '..') {
      newPath = currentPath.split('/').slice(0, -1).join('/')
      if (newPath === '') newPath = '/home/' + userName
    } else if (dir.startsWith('/')) {
      newPath = dir
    } else {
      newPath = `${currentPath}/${dir}`
    }

    const parts = newPath.split('/')
    if (parts[1] !== 'home' || parts[2] !== userName || 
        (parts[3] === 'challenges' && parts.length > 6)) {
      setTerminalOutput(prev => [...prev, `cd: ${dir}: No such file or directory`, ''])
      return
    }

    setCurrentPath(newPath)
    setTerminalOutput(prev => [...prev, `Changed directory to ${newPath}`])
  }

  const printWorkingDirectory = () => {
    setTerminalOutput(prev => [...prev, currentPath, ''])
  }

  const catFile = (filename: string) => {
    const parts = currentPath.split('/')
    if (parts.length !== 6 || parts[3] !== 'challenges') {
      setTerminalOutput(prev => [...prev, `cat: ${filename}: No such file or directory`, ''])
      return
    }

    const difficulty = parts[4]
    const questionName = parts[5]
    const currentQuestion = questions.find(q => q.difficulty.toLowerCase() === difficulty && q.name === questionName)

    if (filename === 'challenge.txt' && currentQuestion) {
      setTerminalOutput(prev => [
        ...prev,
        `Mission: ${currentQuestion.name}`,
        `Difficulty: ${currentQuestion.difficulty}`,
        `Description: ${currentQuestion.description}`,
        '',
      ])
    } else if (filename === 'hint.md') {
      setTerminalOutput(prev => [...prev, 'No hints available for this challenge.', ''])
    } else {
      setTerminalOutput(prev => [...prev, `cat: ${filename}: No such file or directory`, ''])
    }
  }

  const displayInfo = () => {
    if (question) {
      setTerminalOutput(prev => [
        ...prev,
        `Mission: ${question.name}`,
        `Difficulty: ${question.difficulty}`,
        `Description: ${question.description}`,
        '',
      ])
    } else {
      setTerminalOutput(prev => [...prev, 'No mission selected.', ''])
    }
  }

  const handleAnswer = async (args: string[]) => {
    if (currentPath.includes('/challenges')) {
      await submitAnswer(args.join(' '))
    } else if (args.length >= 2) {
      const questionName = args[0]
      const answer = args.slice(1).join(' ')
      const currentQuestion = questions.find(q => q.name === questionName)
      if (currentQuestion) {
        await submitAnswer(answer, currentQuestion)
      } else {
        setTerminalOutput(prev => [...prev, `Question not found: ${questionName}`, ''])
      }
    } else {
      setTerminalOutput(prev => [...prev, 'Invalid answer command format.', ''])
    }
  }

  const submitAnswer = async (answer: string, currentQuestion = question) => {
    if (!currentQuestion) {
      setTerminalOutput(prev => [...prev, 'No mission selected. Navigate to a challenge directory to submit an answer.', ''])
      return
    }

    setTerminalOutput(prev => [...prev, 'Submitting answer...', ''])
    try {
      const res = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: currentQuestion.id, userAnswer: answer }),
      })

      const data = await res.json()
      if (res.ok) {
        setTerminalOutput(prev => [...prev, 'Access granted. Challenge completed!', ''])
        onComplete(currentQuestion.id)
        toast.success('Correct answer! Challenge completed.')
      } else {
        setTerminalOutput(prev => [...prev, 'Access denied. Incorrect answer. Try again.', ''])
        toast.error('Incorrect answer.')
      }
    } catch (error) {
      setTerminalOutput(prev => [...prev, 'Error processing request.', ''])
      toast.error('An error occurred.')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(userInput)
      setUserInput('')
    }
  }

  return (
    <Card className="w-full h-full bg-black text-green-500 font-mono border-none outline outline-2 outline-green-500">
      <CardContent className="p-6 flex flex-col h-full justify-between">
        <ScrollArea className="flex-grow mb-4 rounded h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-2 flex flex-col justify-end">
            {terminalOutput.map((line, index) => (
              <div key={index} className="break-all">
                {line}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex space-x-2">
          <Input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-black text-green-500 border border-green-500 focus:ring-green-500 focus:border-green-500"
            placeholder=""
            aria-label="Terminal command input"
          />
        </div>
      </CardContent>
    </Card>
  )
}

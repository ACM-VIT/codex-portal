// app/admin/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Moon, Sun, Minus } from 'lucide-react';
import Spinner from '../../components/Spinner'; 

interface Question {
  id: string;
  name: string;
  difficulty: string;
  answer: string;
}

interface UserStatus {
  user_id: string;
  username: string;
  total_challenges: number;
  completed_challenges: number;
  completion_percentage: number;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [questionName, setQuestionName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [answer, setAnswer] = useState(''); // New field for the answer
  const [responseMessage, setResponseMessage] = useState('');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);

  // State for Active Users
  const [activeUsers, setActiveUsers] = useState<UserStatus[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [usersError, setUsersError] = useState<string>('');

  // Fetch active questions from the backend
  useEffect(() => {
    const fetchActiveQuestions = async () => {
      try {
        const res = await fetch('/api/questions', {
          method: 'GET',
        });
        if (res.ok) {
          const data = await res.json();
          setActiveQuestions(data);
        } else {
          console.error('Failed to fetch active questions');
        }
      } catch (error) {
        console.error('Error fetching active questions:', error);
      }
    };

    fetchActiveQuestions();
  }, []);

  // Fetch active users from the backend
  useEffect(() => {
    const fetchActiveUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const res = await fetch('/api/admin/users', {
          method: 'GET',
        });
        if (res.ok) {
          const data: UserStatus[] = await res.json();
          setActiveUsers(data);
        } else {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch active users');
        }
      } catch (error: any) {
        console.error('Error fetching active users:', error);
        setUsersError(error.message);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchActiveUsers();

    // Optional: Implement polling every 30 seconds for real-time updates
    const intervalId = setInterval(fetchActiveUsers, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Dark mode effect
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Admin login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Replace with secure authentication in production
      setIsAuthenticated(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Invalid password');
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Submit new question handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseMessage('');

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionName,
          description,
          difficulty,
          answer, // Add the answer to the payload
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponseMessage(`Question added: ${data.question.name}`);
        setQuestionName('');
        setDescription('');
        setAnswer(''); // Clear the answer field
        setActiveQuestions([...activeQuestions, { id: data.question.id, name: data.question.name, difficulty, answer }]);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      setResponseMessage(`Failed to add question: ${error.message}`);
    }
  };

  // Remove question handler
  const removeQuestion = async (id: string) => {
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setActiveQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== id));
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete question');
      }
    } catch (error: any) {
      console.error('Error:', error);
      setResponseMessage(`Failed to delete question: ${error.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'dark' : ''}`}>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          <span className="sr-only">Toggle dark mode</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'dark' : ''} bg-background text-foreground`}>
      <div className="flex flex-col lg:flex-row gap-8 h-full">
        {/* Add New Question Card */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Add New Question</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="questionName">Question Name</Label>
                <Input
                  id="questionName"
                  value={questionName}
                  onChange={(e) => setQuestionName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Answer</Label>
                <Input
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Submit Question
              </Button>
            </form>
            {responseMessage && (
              <p className={`mt-4 text-sm ${responseMessage.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
                {responseMessage}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Active Questions Card */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Active Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {activeQuestions.map((question) => (
                <li key={question.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                  <span>
                    {question.name} - {question.difficulty}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(question.id)}
                    aria-label={`Remove ${question.name}`}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Active Users Card */}
      <div className="mt-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <Spinner size="h-8 w-8" color="border-green-500" /> // Using the Spinner component
            ) : usersError ? (
              <p className="text-red-500">Error: {usersError}</p>
            ) : activeUsers.length === 0 ? (
              <p>No users are currently active.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b">Username</th>
                      <th className="px-4 py-2 border-b">Completed Challenges</th>
                      <th className="px-4 py-2 border-b">Total Challenges</th>
                      <th className="px-4 py-2 border-b">Completion %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeUsers.map((user, index) => (
                      <tr
                        key={user.user_id}
                        className={`text-center ${
                          index % 2 === 0 ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'
                        } hover:bg-gray-200 dark:hover:bg-gray-600`}
                      >
                        <td className="border px-4 py-2">{user.username}</td>
                        <td className="border px-4 py-2">{user.completed_challenges}</td>
                        <td className="border px-4 py-2">{user.total_challenges}</td>
                        <td className="border px-4 py-2">{user.completion_percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dark Mode Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4"
        onClick={toggleDarkMode}
      >
        {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
        <span className="sr-only">Toggle dark mode</span>
      </Button>
    </div>
  );
}

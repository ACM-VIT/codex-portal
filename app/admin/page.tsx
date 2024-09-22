"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { Minus } from "lucide-react";

interface Question {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  answer?: string; // Optional answer field
}

interface Submission {
  id: string;
  userName: string;
  questionName: string;
  status: "Failed" | "Completed";
  timestamp: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [questionName, setQuestionName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [answer, setAnswer] = useState(""); // Only Answer field now
  const [responseMessage, setResponseMessage] = useState("");
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveQuestions = async () => {
      try {
        const res = await fetch("/api/questions", { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          setActiveQuestions(data);
        } else {
          console.error("Failed to fetch active questions");
        }
      } catch (error) {
        console.error("Error fetching active questions:", error);
      }
    };

    fetchActiveQuestions();
  }, []);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch("/api/submissions", { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data);
        } else {
          console.error("Failed to fetch submissions");
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    fetchSubmissions();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "thisisaprotectedpasswordsurelynooneisguessingit") {
      setIsAuthenticated(true);
      setErrorMessage("");
    } else {
      setErrorMessage("Invalid password");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseMessage("");

    // Ensure that the answer field is filled
    if (!answer) {
      setResponseMessage("The 'Answer' field must be filled.");
      return;
    }

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionName,
          description,
          difficulty,
          answer, // Answer is mandatory
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add question.");
      }

      const data = await res.json();
      setResponseMessage(`Question added: ${data.question.name}`);
      setQuestionName("");
      setDescription("");
      setAnswer("");
      setActiveQuestions([...activeQuestions, data.question]);
    } catch (error: any) {
      setResponseMessage(`Failed to add question: ${error.message}`);
    }
  };

  const handleDeleteConfirmation = (id: string) => {
    if (deleteConfirmationId === id) {
      removeQuestion(id);
      setDeleteConfirmationId(null);
    } else {
      setDeleteConfirmationId(id);
    }
  };

  const removeQuestion = async (id: string) => {
    try {
      const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setActiveQuestions((prevQuestions) =>
          prevQuestions.filter((q) => q.id !== id)
        );
        setResponseMessage(`Question deleted successfully.`);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete question");
      }
    } catch (error: any) {
      console.error("Error:", error);
      setResponseMessage(`Failed to delete question: ${error.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-green-500 font-mono">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Admin Login
            </CardTitle>
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
              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-900 text-green-500 font-mono">
      {/* Left Side: Active Questions */}
      <div className="w-full lg:w-1/4 flex flex-col border-r border-gray-700 p-4 overflow-y-auto bg-gray-800">
        <Card className="bg-gray-800 text-green-500">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Active Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {activeQuestions.map((question) => (
                <li
                  key={question.id}
                  className="flex items-center justify-between p-2 bg-gray-700 rounded-md"
                >
                  <span>
                    {question.name} - {question.difficulty}
                  </span>
                  <div className="flex items-center">
                    {deleteConfirmationId === question.id ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteConfirmation(question.id)}
                        className="ml-2"
                      >
                        Delete
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteConfirmation(question.id)}
                        aria-label={`Remove ${question.name}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Middle: Add New Question */}
      <div className="w-full lg:w-1/2 p-4 flex flex-col bg-gray-900">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-green-500">
            Admin Dashboard
          </h2>
        </div>
        <div className="flex-grow relative">
          <Card className="bg-gray-900 text-green-500">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Add New Question
              </CardTitle>
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
                  <Label htmlFor="answer">Answer (Exact or Regex Pattern)</Label>
                  <Input
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Exact answer or regex pattern"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Submit Question
                </Button>
              </form>
              {responseMessage && (
                <p
                  className={`mt-4 text-sm ${
                    responseMessage.includes("Failed")
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {responseMessage}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side: Submissions */}
      <div className="w-full lg:w-1/4 flex flex-col border-l border-gray-700 p-4 bg-gray-800">
  <Card className="bg-gray-800 text-green-500 h-full">
    <CardHeader>
      <CardTitle className="text-xl font-bold">Submissions</CardTitle>
    </CardHeader>
    <CardContent className="flex-grow overflow-y-auto max-h-[100vh]"> {/* Add max-h and overflow */}
      <ul className="space-y-2">
        {submissions.map((submission) => (
          <li key={submission.id} className="p-2 bg-gray-700 rounded-md">
            <div className="flex justify-between">
              <span className="font-semibold">{submission.userName}</span>
              <span className="text-sm text-gray-400">
                {new Date(submission.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="mt-1">
              <span className="text-sm">Question: {submission.questionName}</span>
            </div>
            <div className="mt-1">
              <span
                className={`text-sm font-semibold ${
                  submission.status === "Completed" ? "text-green-400" : "text-red-400"
                }`}
              >
                {submission.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
</div>
    </div>
  );
}

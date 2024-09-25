"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Card, CardContent } from "./ui/Card";
import { Input } from "./ui/Input";
import { toast } from "react-toastify";
import { Question } from "../lib/types";
import DOMPurify from "dompurify";

interface QuestionBoxProps {
  question: Question;
  onSubmitAnswer: (answer: string) => void;
}

export default function QuestionBox({ question, onSubmitAnswer }: QuestionBoxProps) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (question.completed) {
      toast.info("You have already completed this challenge.");
    }
  }, [question.completed]);

  const handleSubmit = async () => {
    if (question.completed) {
      toast.error("You have already completed this challenge.");
      return;
    }

    if (answer.trim() === "") {
      toast.error("Please enter an answer.");
      return;
    }

    setIsSubmitting(true);
    await onSubmitAnswer(answer);
    setIsSubmitting(false);
    setAnswer("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Card
      className="h-full flex flex-col justify-between bg-gray-900 text-green-500 relative border border-white overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center"
      >
        <img
          src="/images/cx.png"
          alt="Watermark"
          className="max-w-xs"
        />
      </div>
      <CardContent className="flex-grow relative z-10">
        {/* Title */}
        <h2 className="text-3xl font-semibold mt-6 mb-6 text-green-500">
          Question: {question.name}
        </h2>
        <div
          className="text-lg text-gray-300 mb-6 whitespace-pre-wrap question-description"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(question.description, {
              ADD_TAGS: ["a", "br"], 
              ADD_ATTR: ["href", "target", "rel"], 
            }),
          }}
        ></div>
      </CardContent>
      {/* Answer Input and Submit Button */}
      <CardContent className="pt-0 flex items-center justify-between relative z-10">
        <Input
          type="text"
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          className="text-green-500 w-full bg-gray-800"
          disabled={question.completed}
        />
        <Button
          onClick={handleSubmit}
          variant="primary"
          className="ml-4 bg-green-600 hover:bg-green-700"
          disabled={question.completed || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </CardContent>
    </Card>
  );
}

// components/QuestionPage.js
import { useState } from 'react';

export default function QuestionPage({ question, questionId }) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionId, answer }),
      });

      const data = await response.json();
      if (data.correct) {
        // Update the UI to show the correct answer or points gained
      } else {
        setError('Incorrect answer');
      }
    } catch (err) {
      setError('Error submitting answer');
    }
  };

  return (
    <div>
      <h1>{question}</h1>
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Enter your answer"
      />
      <button onClick={handleSubmit}>Submit</button>
      {error && <p>{error}</p>}
    </div>
  );
}

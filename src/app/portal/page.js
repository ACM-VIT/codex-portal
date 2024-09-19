"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Portal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('questions');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-1/5 bg-white shadow-lg">
        <nav className="flex flex-col h-full">
          <div className="p-6 text-xl font-semibold text-gray-700">
            Codex Cryptum Portal
          </div>
          <ul className="flex flex-col space-y-4 p-4">
            <li
              className={`p-3 cursor-pointer ${
                activeTab === 'questions'
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-blue-100'
              }`}
              onClick={() => handleTabChange('questions')}
            >
              Questions
            </li>
            <li
              className={`p-3 cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-blue-100'
              }`}
              onClick={() => handleTabChange('leaderboard')}
            >
              Leaderboard
            </li>
            <li
              className="p-3 cursor-pointer hover:bg-blue-100"
              onClick={() => {
                // Perform sign-out logic here
                router.push('/signin');
              }}
            >
              Sign Out
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="w-4/5 p-8">
        {activeTab === 'questions' && <Questions />}
        {activeTab === 'leaderboard' && <Leaderboard />}
      </main>
    </div>
  );
}

function Questions() {
  return (
    <div className="text-xl font-semibold">
      <h1 className="mb-6">Questions Section</h1>
      <p>Display questions here.</p>
    </div>
  );
}

function Leaderboard() {
  return (
    <div className="text-xl font-semibold">
      <h1 className="mb-6">Leaderboard Section</h1>
      <p>Display leaderboard here.</p>
    </div>
  );
}

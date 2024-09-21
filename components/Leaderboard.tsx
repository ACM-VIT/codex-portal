"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "./ui/Card";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import { LeaderboardEntry } from "../lib/types";
import { useSession } from "next-auth/react";

// Function to clean the user name, removing any trailing numbers
const cleanUserName = (fullName: string): string => {
  return fullName.replace(/\s*\d+$/, "");
};

const Loader = () => (
  <div className="flex items-center justify-center h-48">
    <div className="w-12 h-12 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  currentUserName: string;
}

export default function Leaderboard({ leaderboard, currentUserName }: LeaderboardProps) {
  const { data: session } = useSession();
  const eventSourceRef = useRef<EventSource | null>(null);

  const userEntry = leaderboard.find(
    (entry) => entry.user_name === session?.user?.name
  );

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xl font-semibold text-green-500 mb-4">Leaderboard</h3>
      <div className="flex-1 no-scrollbar overflow-y-auto space-y-2">
        {leaderboard.map((player, index) => (
          <Card
            key={`${player.user_name}-${player.points}-${index}`}
            className={`bg-gray-900 text-green-500 border-none ${
              player.user_name === currentUserName ? "bg-green-800" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">
                  {DOMPurify.sanitize(cleanUserName(player.user_name))}
                  {player.user_name === currentUserName ? " (You)" : ""}
                </h4>
                <span className="text-sm">Rank: {index + 1}</span>
              </div>
              <p className="mt-2 text-sm text-gray-300">Score: {player.points}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Fixed User Entry at the Bottom */}
      {userEntry && (
        <div className="mt-2">
          <Card className="bg-gray-900 text-green-500 border-none">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">
                  {DOMPurify.sanitize(cleanUserName(userEntry.user_name))} (You)
                </h4>
                <span className="text-sm">
                  Rank: {leaderboard.findIndex((entry) => entry.user_name === userEntry.user_name) + 1}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-300">
                Score: {userEntry.points}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

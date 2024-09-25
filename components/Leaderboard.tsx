"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "./ui/Card";
import { LeaderboardEntry } from "../lib/types";
import DOMPurify from "dompurify";
import { useSession } from "next-auth/react";

const Loader = () => (
  <div className="flex items-center justify-center h-48">
    <div className="w-12 h-12 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

interface LeaderboardProps {
  currentUserName: string;
}

export default function Leaderboard({ currentUserName }: LeaderboardProps) {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const connectSSE = () => {
      const eventSource = new EventSource("/api/sse-leaderboard");
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        console.log("Received data:", event.data); // Debug log
        const data = JSON.parse(event.data);
        setLeaderboard(data);
        setLoading(false); 
      };

      eventSource.onerror = (error) => {
        console.error("Error with SSE connection:", error);
        eventSource.close();

        setTimeout(() => {
          connectSSE();
        }, 5000);
      };
    };

    connectSSE();

    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const userEntry = leaderboard.find(
    (entry) => entry.user_name === session?.user?.name
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xl font-semibold text-green-500 mb-4">Leaderboard</h3>
      
      {/* Scrollable list of all leaderboard entries */}
      <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
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
                  {DOMPurify.sanitize(player.user_name)}
                  {player.user_name === currentUserName ? " (You)" : ""}
                </h4>
                <span className="text-sm">Rank: {index + 1}</span>
              </div>
              <p className="mt-2 text-sm text-gray-300">
                Score: {player.points}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {userEntry && (
        <div className="mt-2">
          <Card className="bg-gray-900 text-green-500 border-none">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">
                  {DOMPurify.sanitize(userEntry.user_name)} (You)
                </h4>
                <span className="text-sm">
                  Rank:{" "}
                  {leaderboard.findIndex(
                    (entry) => entry.user_name === userEntry.user_name
                  ) + 1}
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

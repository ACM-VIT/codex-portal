'use client';

import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { useEffect, useState } from 'react';

interface LeaderboardEntry {
  id?: string;
  user_name: string;
  points: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/sse-leaderboard');

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setLeaderboard(data);
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <Card className="bg-black border-green-500 flex-grow backdrop-blur-sm bg-opacity-30">
      <CardHeader>
        <CardTitle className="text-green-500 text-2xl font-mono glitch" data-text="Leaderboard">
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-y-auto max-h-[350px]">
          <Table className="min-w-full divide-y divide-green-500 border-collapse bg-black">
            <TableHeader className="bg-black">
              <TableRow>
                <TableHead className="text-green-500 text-xl font-mono border border-green-500 bg-black">Rank</TableHead>
                <TableHead className="text-green-500 text-xl font-mono border border-green-500 bg-black">Hacker</TableHead>
                <TableHead className="text-green-500 text-xl font-mono border border-green-500 bg-black">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-black">
              {leaderboard.map((player, index) => (
                <TableRow key={player.id || index} className="bg-black hover:bg-green-900">
                  <TableCell className="font-mono text-green-500 text-lg border border-green-500 bg-black">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-mono text-green-500 text-lg border border-green-500 bg-black">
                    {player.user_name}
                  </TableCell>
                  <TableCell className="font-mono text-green-500 text-lg border border-green-500 bg-black">
                    {player.points}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

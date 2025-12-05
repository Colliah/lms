"use client";

import { Crown, Flame, Medal, Trophy, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getLeaderboardAction } from "@/actions/leaderboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  score: number;
  streak: number;
  wordsLearned: number;
  isCurrentUser: boolean;
}

type LeaderboardType = "weekly" | "monthly" | "allTime";

const rankIcons = {
  1: <Crown className="h-5 w-5 text-yellow-500" />,
  2: <Medal className="h-5 w-5 text-gray-400" />,
  3: <Medal className="h-5 w-5 text-amber-600" />,
};

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [type, setType] = useState<LeaderboardType>("weekly");
  const [isLoading, setIsLoading] = useState(true);

  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true);
    const result = await getLeaderboardAction(type);
    if (result.success && result.data) {
      setEntries(result.data);
    }
    setIsLoading(false);
  }, [type]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
          <Tabs
            value={type}
            onValueChange={(v) => setType(v as LeaderboardType)}
          >
            <TabsList className="h-8">
              <TabsTrigger value="weekly" className="text-xs px-2">
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-2">
                Monthly
              </TabsTrigger>
              <TabsTrigger value="allTime" className="text-xs px-2">
                All Time
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {["a", "b", "c", "d", "e"].map((key) => (
              <div key={key} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No activity yet. Start learning to appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.slice(0, 10).map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  entry.isCurrentUser
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/50"
                }`}
              >
                {/* Rank */}
                <div className="w-8 flex justify-center">
                  {rankIcons[entry.rank as keyof typeof rankIcons] || (
                    <span className="text-sm font-medium text-muted-foreground">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.image || undefined} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`truncate text-sm ${entry.isCurrentUser ? "font-semibold" : ""}`}
                  >
                    {entry.name}
                    {entry.isCurrentUser && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        You
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.wordsLearned} words
                    {entry.streak > 0 && (
                      <span className="ml-2 inline-flex items-center gap-0.5">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {entry.streak}
                      </span>
                    )}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="font-semibold">
                    {entry.score.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

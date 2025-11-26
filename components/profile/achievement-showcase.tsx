"use client";

import { Loader2, Lock, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserAchievementsAction } from "@/actions/profile";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AchievementShowcase() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      const result = await getUserAchievementsAction();
      if (result.success && result.data) {
        setAchievements(result.data);
      }
      setIsLoading(false);
    }
    fetchAchievements();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Achievements
        </CardTitle>
        <CardDescription>Your earned badges and milestones</CardDescription>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No achievements yet</p>
            <p className="text-sm mt-1">
              Keep learning to unlock your first badge!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {achievements.map((userAchievement) => (
              <div
                key={userAchievement.id}
                className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold">
                    {userAchievement.achievement.name}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {userAchievement.achievement.description}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {userAchievement.achievement.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

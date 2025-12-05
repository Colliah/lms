"use client";

import {
  BookOpen,
  Brain,
  ChevronRight,
  Compass,
  RefreshCw,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { generateLearningPathAction } from "@/actions/learning-path";
import type { ProficiencyLevel } from "@/app/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface LearningRecommendation {
  type: "vocabulary" | "grammar" | "reading";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  action: string;
  actionUrl: string;
  reason: string;
}

interface LearningPathData {
  recommendations: LearningRecommendation[];
  focusAreas: string[];
  suggestedDailyGoals: {
    vocabulary: number;
    grammar: number;
    reading: number;
  };
  currentLevel: ProficiencyLevel;
  progressToNextLevel: number;
}

const typeIcons = {
  vocabulary: BookOpen,
  grammar: Brain,
  reading: TrendingUp,
};

const priorityColors = {
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  low: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
};

export function LearningPathDashboard() {
  const [data, setData] = useState<LearningPathData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPath = useCallback(async () => {
    const result = await generateLearningPathAction();
    if (result.success && result.data) {
      setData(result.data as LearningPathData);
    }
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadPath();
  }, [loadPath]);

  function refreshPath() {
    setIsRefreshing(true);
    loadPath();
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {["a", "b", "c"].map((key) => (
            <Skeleton key={key} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Unable to generate learning path
        </CardContent>
      </Card>
    );
  }

  const nextLevel = {
    A1: "A2",
    A2: "B1",
    B1: "B2",
    B2: "C1",
    C1: "C2",
    C2: "C2",
  }[data.currentLevel];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Compass className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Your Learning Path
            </h2>
            <p className="text-muted-foreground">
              Personalized recommendations based on your progress
            </p>
          </div>
        </div>
        <Button
          onClick={refreshPath}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Level Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {data.currentLevel}
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Badge className="text-lg px-3 py-1">{nextLevel}</Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {data.progressToNextLevel}% to next level
            </span>
          </div>
          <Progress value={data.progressToNextLevel} className="h-3" />
        </CardContent>
      </Card>

      {/* Focus Areas & Daily Goals */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5" />
              Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.focusAreas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.focusAreas.map((area) => (
                  <Badge key={area} variant="secondary" className="capitalize">
                    {area}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Great job! No specific areas need extra attention.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Suggested Daily Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Vocabulary</span>
              <span className="font-medium">
                {data.suggestedDailyGoals.vocabulary} words
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Grammar</span>
              <span className="font-medium">
                {data.suggestedDailyGoals.grammar} exercises
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Reading</span>
              <span className="font-medium">
                {data.suggestedDailyGoals.reading} passages
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        <h3 className="font-semibold">Recommended Activities</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {data.recommendations.map((rec, idx) => {
            const Icon = typeIcons[rec.type];
            return (
              <Card
                key={`${rec.type}-${idx}`}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{rec.title}</span>
                    </div>
                    <Badge
                      className={priorityColors[rec.priority]}
                      variant="secondary"
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {rec.description}
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    {rec.reason}
                  </p>
                  <Link href={rec.actionUrl}>
                    <Button size="sm" className="w-full">
                      {rec.action}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

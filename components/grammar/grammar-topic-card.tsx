"use client";

import { BookOpen, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { ProficiencyLevel } from "@/app/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GrammarTopicCardProps {
  topic: {
    id: string;
    name: string;
    description: string;
    difficulty: ProficiencyLevel;
    exerciseCount: number;
    questionCount: number;
    userProgress: { completed: number; total: number } | null;
  };
}

const difficultyColors: Record<ProficiencyLevel, string> = {
  A1: "bg-emerald-500",
  A2: "bg-green-500",
  B1: "bg-yellow-500",
  B2: "bg-orange-500",
  C1: "bg-red-500",
  C2: "bg-purple-500",
};

export function GrammarTopicCard({ topic }: GrammarTopicCardProps) {
  const completedExercises = topic.userProgress?.completed ?? 0;
  const progressPercent =
    topic.exerciseCount > 0
      ? Math.round((completedExercises / topic.exerciseCount) * 100)
      : 0;

  return (
    <Link href={`/grammar?topicId=${topic.id}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-tight">
              {topic.name}
            </CardTitle>
            <Badge
              variant="secondary"
              className={`${difficultyColors[topic.difficulty]} text-white shrink-0`}
            >
              {topic.difficulty}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {topic.description}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{topic.exerciseCount} exercises</span>
            </div>
            <span>•</span>
            <span>{topic.questionCount} questions</span>
          </div>

          {topic.userProgress && completedExercises > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>
                    {completedExercises}/{topic.exerciseCount}
                  </span>
                </div>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

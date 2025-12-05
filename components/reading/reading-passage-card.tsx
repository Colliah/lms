"use client";

import { BookOpen, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import type { ProficiencyLevel } from "@/app/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReadingPassageCardProps {
  passage: {
    id: string;
    title: string;
    difficulty: ProficiencyLevel;
    topics: string[];
    wordCount: number;
    questionCount: number;
    userProgress: { completed: boolean; score: number | null } | null;
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

const estimatedReadingTime = (wordCount: number): number => {
  // Average reading speed: 200 words per minute
  return Math.ceil(wordCount / 200);
};

export function ReadingPassageCard({ passage }: ReadingPassageCardProps) {
  const isCompleted = passage.userProgress?.completed;
  const score = passage.userProgress?.score;

  return (
    <Link href={`/reading/${passage.id}`}>
      <Card
        className={`h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer ${isCompleted ? "border-green-500/30 bg-green-50/30 dark:bg-green-950/10" : ""}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-tight line-clamp-2">
              {passage.title}
            </CardTitle>
            <Badge
              variant="secondary"
              className={`${difficultyColors[passage.difficulty]} text-white shrink-0`}
            >
              {passage.difficulty}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {passage.topics.slice(0, 3).map((topic) => (
              <Badge key={topic} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{passage.wordCount} words</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>~{estimatedReadingTime(passage.wordCount)} min</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {passage.questionCount} questions
            </span>
            {isCompleted && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>{score}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

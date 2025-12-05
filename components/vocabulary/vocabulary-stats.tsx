"use client";

import { BookOpen, CheckCircle2, Clock, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VocabularyStatsProps {
  stats: {
    totalWords: number;
    masteredWords: number;
    learningWords: number;
    dueReviews: number;
    accuracyRate: number;
  };
}

export function VocabularyStats({ stats }: VocabularyStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Words</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalWords}</div>
          <p className="text-xs text-muted-foreground">
            Words in your learning set
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mastered</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.masteredWords}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.totalWords > 0
              ? `${Math.round((stats.masteredWords / stats.totalWords) * 100)}% of total`
              : "Start learning!"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Due for Review</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {stats.dueReviews}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.dueReviews > 0 ? "Ready to review" : "All caught up!"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
          <Target className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.accuracyRate}%
          </div>
          <p className="text-xs text-muted-foreground">Last 30 days average</p>
        </CardContent>
      </Card>
    </div>
  );
}

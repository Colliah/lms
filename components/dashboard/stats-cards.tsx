import { BookOpen, Clock, Flame, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatsCardsProps {
  streak: {
    currentStreak: number;
    longestStreak: number;
    freezesAvailable: number;
  };
  vocabularyStats: {
    totalWords: number;
    masteredWords: number;
    learningWords: number;
    dueReviews: number;
    accuracyRate: number;
  };
  todayActivity: {
    wordsLearned: number;
    wordsReviewed: number;
    exercisesCompleted: number;
    totalMinutes: number;
  };
}

export default function StatsCards({
  streak,
  vocabularyStats,
  todayActivity,
}: StatsCardsProps) {
  const masteryPercentage =
    vocabularyStats.totalWords > 0
      ? Math.round(
          (vocabularyStats.masteredWords / vocabularyStats.totalWords) * 100,
        )
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{streak.currentStreak} days</div>
          <p className="text-xs text-muted-foreground mt-1">
            Longest: {streak.longestStreak} days
          </p>
          {streak.freezesAvailable > 0 && (
            <p className="text-xs text-blue-500 mt-1">
              {streak.freezesAvailable} freeze
              {streak.freezesAvailable !== 1 ? "s" : ""} available
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vocabulary</CardTitle>
          <BookOpen className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {vocabularyStats.masteredWords}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            of {vocabularyStats.totalWords} words mastered
          </p>
          <Progress value={masteryPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {vocabularyStats.dueReviews} due for review
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Today's Progress
          </CardTitle>
          <Target className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {todayActivity.wordsLearned + todayActivity.wordsReviewed}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            words ({todayActivity.wordsLearned} new,{" "}
            {todayActivity.wordsReviewed} reviewed)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {todayActivity.exercisesCompleted} exercises completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Study Time</CardTitle>
          <Clock className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{todayActivity.totalMinutes}</div>
          <p className="text-xs text-muted-foreground mt-1">minutes today</p>
          <p className="text-xs text-green-600 mt-1">
            {vocabularyStats.accuracyRate}% accuracy rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

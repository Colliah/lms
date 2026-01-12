"use client";

import { Calendar, Clock, GraduationCap, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviewSchedule } from "@/hooks/use-queries";

interface ReviewScheduleData {
  overdue: number;
  today: number;
  schedule: Array<{ date: string; count: number }>;
  upcomingWords: Array<{
    word: string;
    dueDate: string;
    interval: number;
    mastered: boolean;
  }>;
  masteryStats: {
    new: number;
    learning: number;
    mastered: number;
  };
  intervalDistribution: Record<string, number>;
  totalLearning: number;
}

export function ReviewScheduleVisualization() {
  const { data, isLoading } = useReviewSchedule();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["a", "b", "c", "d"].map((key) => (
          <Skeleton key={key} className="h-32" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Unable to load review schedule
        </CardContent>
      </Card>
    );
  }

  const totalMastery =
    data.masteryStats.new +
    data.masteryStats.learning +
    data.masteryStats.mastered;
  const masteryProgress =
    totalMastery > 0
      ? Math.round((data.masteryStats.mastered / totalMastery) * 100)
      : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) return "Today";
    if (date.getTime() === tomorrow.getTime()) return "Tomorrow";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.today}</div>
            {data.overdue > 0 && (
              <p className="text-xs text-destructive">
                +{data.overdue} overdue
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Learning
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLearning}</div>
            <p className="text-xs text-muted-foreground">words in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mastered</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.masteryStats.mastered}
            </div>
            <Progress value={masteryProgress} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {masteryProgress}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.schedule.reduce((sum, d) => sum + d.count, 0) + data.today}
            </div>
            <p className="text-xs text-muted-foreground">reviews scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">7-Day Review Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {data.schedule.map((day, idx) => (
              <div key={day.date} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {idx === 0
                    ? "Today"
                    : new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    day.count === 0
                      ? "bg-muted"
                      : day.count < 5
                        ? "bg-green-100 dark:bg-green-950"
                        : day.count < 10
                          ? "bg-yellow-100 dark:bg-yellow-950"
                          : "bg-red-100 dark:bg-red-950"
                  }`}
                >
                  <span className="font-semibold">
                    {idx === 0 ? data.today + data.overdue : day.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Mastery Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mastery Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">New</span>
              <Badge variant="secondary">{data.masteryStats.new}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Learning</span>
              <Badge
                variant="outline"
                className="bg-yellow-50 dark:bg-yellow-950"
              >
                {data.masteryStats.learning}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Mastered</span>
              <Badge className="bg-green-500">
                {data.masteryStats.mastered}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Interval Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interval Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(data.intervalDistribution).map(
              ([interval, count]) => (
                <div
                  key={interval}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">{interval}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-primary rounded"
                      style={{
                        width: `${Math.max(4, (count / Math.max(1, data.totalLearning)) * 100)}px`,
                      }}
                    />
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ),
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Words */}
      {data.upcomingWords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {data.upcomingWords.slice(0, 8).map((word) => (
                <div
                  key={`${word.word}-${word.dueDate}`}
                  className="flex items-center justify-between p-2 rounded-lg border"
                >
                  <span className="font-medium">{word.word}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(word.dueDate)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

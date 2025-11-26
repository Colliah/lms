import { getDashboardStatsAction } from "@/actions/progress";
import { getVocabularyStatsAction } from "@/actions/vocabulary";
import QuickActions from "@/components/dashboard/quick-actions";

import StatsCards from "@/components/dashboard/stats-cards";
import WeeklyChart from "@/components/dashboard/weekly-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const [dashboardResult, vocabResult] = await Promise.all([
    getDashboardStatsAction(),
    getVocabularyStatsAction(),
  ]);

  if (!dashboardResult.success || !vocabResult.success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {dashboardResult.error ||
                vocabResult.error ||
                "Failed to load dashboard data"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract data after success check with proper type narrowing
  const { data: dashboard } = dashboardResult;
  const { data: vocabStats } = vocabResult;

  // Additional safety check (should never happen after success check)
  if (!dashboard || !vocabStats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Failed to load dashboard data
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your learning progress and continue your journey
        </p>
      </div>

      <StatsCards
        streak={dashboard.streak}
        vocabularyStats={vocabStats}
        todayActivity={dashboard.todayActivity}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyChart data={dashboard.weeklyProgress} />
        </div>
        <div>
          <QuickActions vocabStats={vocabStats} />
        </div>
      </div>
    </div>
  );
}

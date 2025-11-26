import { Suspense } from "react";
import { getDashboardStatsAction } from "@/actions/progress";
import { getVocabularyStatsAction } from "@/actions/vocabulary";
import QuickActions from "@/components/dashboard/quick-actions";
import StatsCards from "@/components/dashboard/stats-cards";
import WeeklyChart from "@/components/dashboard/weekly-chart";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";

async function DashboardContent() {
  const [dashboardResult, vocabResult] = await Promise.all([
    getDashboardStatsAction(),
    getVocabularyStatsAction(),
  ]);

  if (!dashboardResult.success) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
          <p className="text-destructive">
            Failed to load dashboard: {dashboardResult.error}
          </p>
        </div>
      </div>
    );
  }

  if (!vocabResult.success) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
          <p className="text-destructive">
            Failed to load vocabulary stats: {vocabResult.error}
          </p>
        </div>
      </div>
    );
  }

  if (!dashboardResult.data || !vocabResult.data) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
          <p className="text-destructive">No data available</p>
        </div>
      </div>
    );
  }

  const { streak, todayActivity, weeklyProgress } = dashboardResult.data;
  const vocabularyStats = vocabResult.data;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your learning progress.
        </p>
      </div>

      <StatsCards
        streak={streak}
        vocabularyStats={vocabularyStats}
        todayActivity={todayActivity}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklyChart data={weeklyProgress} />
        <QuickActions vocabStats={vocabularyStats} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

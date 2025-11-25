import { prisma } from "@/lib/prisma";

interface CalculateStreakParams {
  userId: string;
}

interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  freezesAvailable: number;
}

export async function calculateStreak(
  params: CalculateStreakParams,
): Promise<StreakResult> {
  const { userId } = params;

  try {
    const streak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    if (!streak) {
      // Create initial streak record
      const newStreak = await prisma.userStreak.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          freezesAvailable: 0,
        },
      });
      return newStreak;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = streak.lastActivityDate
      ? new Date(streak.lastActivityDate)
      : null;

    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0);

      const daysSinceActivity = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000),
      );

      if (daysSinceActivity > 1 && streak.freezesAvailable > 0) {
        // Use a freeze
        return await prisma.userStreak.update({
          where: { userId },
          data: {
            freezesAvailable: { decrement: 1 },
            lastActivityDate: today, // Update to today to maintain streak
          },
        });
      } else if (daysSinceActivity > 1) {
        // Streak broken
        return await prisma.userStreak.update({
          where: { userId },
          data: {
            currentStreak: 0,
          },
        });
      }
    }

    return streak;
  } catch (error) {
    console.error("calculateStreak error:", error);
    throw new Error("Failed to calculate streak");
  }
}

interface IncrementStreakParams {
  userId: string;
}

export async function incrementStreak(
  params: IncrementStreakParams,
): Promise<StreakResult> {
  const { userId } = params;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await prisma.userStreak.upsert({
      where: { userId },
      create: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
        freezesAvailable: 0,
      },
      update: {
        currentStreak: { increment: 1 },
        lastActivityDate: today,
      },
    });

    // Update longest streak if current is higher
    if (streak.currentStreak > streak.longestStreak) {
      return await prisma.userStreak.update({
        where: { userId },
        data: {
          longestStreak: streak.currentStreak,
        },
      });
    }

    return streak;
  } catch (error) {
    console.error("incrementStreak error:", error);
    throw new Error("Failed to increment streak");
  }
}

interface GetDashboardStatsParams {
  userId: string;
}

interface DashboardStatsResult {
  streak: StreakResult;
  vocabularyStats: {
    totalWords: number;
    masteredWords: number;
    dueReviews: number;
  };
  todayActivity: {
    wordsLearned: number;
    wordsReviewed: number;
    exercisesCompleted: number;
    totalMinutes: number;
  };
  weeklyProgress: Array<{
    date: string;
    minutes: number;
  }>;
}

export async function getDashboardStats(
  params: GetDashboardStatsParams,
): Promise<DashboardStatsResult> {
  const { userId } = params;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Fetch vocabulary stats separately to avoid Prisma groupBy type inference issues
    const vocabularyStatsRaw = await prisma.userWordProgress.groupBy({
      by: ["mastered"],
      where: { userId },
      _count: { id: true },
    });

    const vocabularyStats = vocabularyStatsRaw as Array<{
      mastered: boolean;
      _count: { id: number };
    }>;

    const [streak, todayActivity, weeklyActivities] = await Promise.all([
      calculateStreak({ userId }),

      prisma.dailyActivity.findUnique({
        where: { userId_date: { userId, date: today } },
      }),

      prisma.dailyActivity.findMany({
        where: {
          userId,
          date: { gte: weekAgo },
        },
        orderBy: { date: "asc" },
      }),
    ]);

    const totalWords = vocabularyStats.reduce(
      (sum, stat) => sum + stat._count.id,
      0,
    );
    const masteredWords =
      vocabularyStats.find((s) => s.mastered)?._count.id || 0;

    const dueReviewsCount = await prisma.userWordProgress.count({
      where: {
        userId,
        nextReviewDate: { lte: new Date() },
      },
    });

    return {
      streak,
      vocabularyStats: {
        totalWords,
        masteredWords,
        dueReviews: dueReviewsCount,
      },
      todayActivity: {
        wordsLearned: todayActivity?.wordsLearned || 0,
        wordsReviewed: todayActivity?.wordsReviewed || 0,
        exercisesCompleted: todayActivity?.exercisesCount || 0,
        totalMinutes: todayActivity?.totalMinutes || 0,
      },
      weeklyProgress: weeklyActivities.map((activity) => ({
        date: activity.date.toISOString(),
        minutes: activity.totalMinutes,
      })),
    };
  } catch (error) {
    console.error("getDashboardStats error:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
}

interface LogStudySessionParams {
  userId: string;
  module: string;
  duration: number; // minutes
}

export async function logStudySession(params: LogStudySessionParams) {
  const { userId, module, duration } = params;

  try {
    // Record session
    await prisma.studySession.create({
      data: {
        userId,
        module,
        duration,
        startedAt: new Date(Date.now() - duration * 60 * 1000),
        endedAt: new Date(),
      },
    });

    // Update daily activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyActivity.upsert({
      where: {
        userId_date: { userId, date: today },
      },
      create: {
        userId,
        date: today,
        totalMinutes: duration,
      },
      update: {
        totalMinutes: { increment: duration },
      },
    });

    // Update streak
    await incrementStreak({ userId });

    return { success: true };
  } catch (error) {
    console.error("logStudySession error:", error);
    throw new Error("Failed to log study session");
  }
}

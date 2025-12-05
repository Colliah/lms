import { prisma } from "@/lib/prisma";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  score: number;
  streak: number;
  wordsLearned: number;
  isCurrentUser: boolean;
}

export type LeaderboardType = "weekly" | "monthly" | "allTime";

export async function getLeaderboard(
  currentUserId: string,
  type: LeaderboardType = "weekly",
): Promise<LeaderboardEntry[]> {
  try {
    // Get date range based on type
    const now = new Date();
    let startDate: Date;

    switch (type) {
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "monthly":
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "allTime":
        startDate = new Date(0); // Beginning of time
        break;
    }

    // Get users with their activity stats
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        streak: {
          select: {
            currentStreak: true,
          },
        },
        dailyActivities: {
          where: {
            date: { gte: startDate },
          },
          select: {
            wordsLearned: true,
            wordsReviewed: true,
            exercisesCount: true,
            readingCount: true,
            totalMinutes: true,
          },
        },
        wordProgress: {
          where: {
            createdAt: type === "allTime" ? undefined : { gte: startDate },
          },
          select: { id: true },
        },
      },
    });

    // Calculate scores for each user
    const leaderboardData = users.map((user) => {
      const activities = user.dailyActivities;

      // Calculate score based on activities
      const wordsLearned = activities.reduce(
        (sum, a) => sum + a.wordsLearned,
        0,
      );
      const wordsReviewed = activities.reduce(
        (sum, a) => sum + a.wordsReviewed,
        0,
      );
      const exercises = activities.reduce(
        (sum, a) => sum + a.exercisesCount,
        0,
      );
      const reading = activities.reduce((sum, a) => sum + a.readingCount, 0);
      const minutes = activities.reduce((sum, a) => sum + a.totalMinutes, 0);

      // Score formula: words + exercises*10 + reading*20 + streak bonus
      const streakBonus = (user.streak?.currentStreak || 0) * 5;
      const score =
        wordsLearned +
        wordsReviewed +
        exercises * 10 +
        reading * 20 +
        streakBonus +
        Math.floor(minutes / 5);

      return {
        userId: user.id,
        name: user.name,
        image: user.image,
        score,
        streak: user.streak?.currentStreak || 0,
        wordsLearned: wordsLearned + wordsReviewed,
        isCurrentUser: user.id === currentUserId,
      };
    });

    // Sort by score and add ranks
    leaderboardData.sort((a, b) => b.score - a.score);

    return leaderboardData.slice(0, 50).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  } catch (error) {
    console.error("getLeaderboard error:", error);
    throw new Error("Failed to fetch leaderboard");
  }
}

export async function getUserRank(
  userId: string,
  type: LeaderboardType = "weekly",
): Promise<{ rank: number; total: number } | null> {
  try {
    const leaderboard = await getLeaderboard(userId, type);
    const userEntry = leaderboard.find((e) => e.userId === userId);

    if (!userEntry) {
      return null;
    }

    return {
      rank: userEntry.rank,
      total: leaderboard.length,
    };
  } catch (error) {
    console.error("getUserRank error:", error);
    return null;
  }
}

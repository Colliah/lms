import { prisma } from "@/lib/prisma";

interface GenerateSnapshotParams {
  userId: string;
}

export async function generateAnalyticsSnapshot(
  params: GenerateSnapshotParams,
) {
  const { userId } = params;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate metrics
    const vocabStats = await prisma.userWordProgress.aggregate({
      where: { userId },
      _count: { id: true },
    });
    const masteredCount = await prisma.userWordProgress.count({
      where: { userId, mastered: true },
    });
    const vocabMastery =
      vocabStats._count.id > 0
        ? Math.round((masteredCount / vocabStats._count.id) * 100)
        : 0;

    const grammarStats = await prisma.userGrammarSubmission.aggregate({
      where: { userId },
      _avg: { score: true },
    });
    const grammarAccuracy = Math.round(grammarStats._avg.score || 0);

    const activity = await prisma.dailyActivity.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    return await prisma.analyticsSnapshot.upsert({
      where: {
        userId_date: { userId, date: today },
      },
      create: {
        userId,
        date: today,
        vocabularyMastery: vocabMastery,
        grammarAccuracy,
        readingSpeed: 0, // Placeholder
        writingScore: 0, // Placeholder
        pronunciationScore: 0, // Placeholder
        timeSpent: activity?.totalMinutes || 0,
      },
      update: {
        vocabularyMastery: vocabMastery,
        grammarAccuracy,
        timeSpent: activity?.totalMinutes || 0,
      },
    });
  } catch (error) {
    console.error("generateAnalyticsSnapshot error:", error);
    throw new Error("Failed to generate analytics snapshot");
  }
}

export async function getDetailedAnalytics(userId: string) {
  try {
    const snapshots = await prisma.analyticsSnapshot.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      take: 30, // Last 30 days
    });

    const weaknesses = await prisma.weaknessArea.findMany({
      where: { userId, resolvedAt: null },
    });

    return { snapshots, weaknesses };
  } catch (error) {
    console.error("getDetailedAnalytics error:", error);
    throw new Error("Failed to fetch detailed analytics");
  }
}

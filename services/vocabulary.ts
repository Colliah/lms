import { ProficiencyLevel, ReviewQuality } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

interface GetDailyVocabularyParams {
  userId: string;
  maxWords?: number;
}

interface DailyVocabularyResult {
  reviews: Array<{
    id: string;
    word: {
      id: string;
      word: string;
      translation: string;
      phonetic: string | null;
      difficulty: ProficiencyLevel;
      partOfSpeech: string;
      definition: string;
      audios: Array<{ url: string }>;
      images: Array<{ url: string }>;
      examples: Array<{
        sentence: string;
        translation: string;
        highlight: string;
      }>;
    };
    easeFactor: number;
    intervalDays: number;
    repetitionCount: number;
  }>;
  newWords: Array<{
    id: string;
    word: string;
    translation: string;
    phonetic: string | null;
    difficulty: ProficiencyLevel;
    partOfSpeech: string;
    definition: string;
    audios: Array<{ url: string }>;
    images: Array<{ url: string }>;
    examples: Array<{
      sentence: string;
      translation: string;
      highlight: string;
    }>;
  }>;
}

export async function getDailyVocabulary(
  params: GetDailyVocabularyParams,
): Promise<DailyVocabularyResult> {
  const { userId, maxWords = 20 } = params;

  try {
    // Fetch due reviews
    const dueReviews = await prisma.userWordProgress.findMany({
      where: {
        userId,
        nextReviewDate: { lte: new Date() },
      },
      include: {
        word: {
          include: {
            audios: true,
            images: true,
            examples: true,
          },
        },
      },
      take: maxWords,
      orderBy: { nextReviewDate: "asc" },
    });

    const newWordsNeeded = maxWords - dueReviews.length;
    let newWords: any[] = [];

    if (newWordsNeeded > 0) {
      // Get user's current level from profile
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId },
        select: { currentLevel: true, interests: true },
      });

      const currentLevel = userProfile?.currentLevel || ProficiencyLevel.A1;

      // Count total available words at user's level (not yet learned)
      const availableCount = await prisma.word.count({
        where: {
          difficulty: currentLevel,
          userProgress: {
            none: { userId },
          },
        },
      });

      if (availableCount > 0) {
        // Get random offset for variety (changes daily based on date + userId hash)
        const today = new Date().toDateString();
        const seed = today + userId;
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
          hash = (hash << 5) - hash + seed.charCodeAt(i);
          hash |= 0;
        }
        const randomOffset =
          Math.abs(hash) % Math.max(1, availableCount - newWordsNeeded);

        // Fetch new words with random offset for variety
        newWords = await prisma.word.findMany({
          where: {
            difficulty: currentLevel,
            userProgress: {
              none: { userId },
            },
          },
          include: {
            audios: true,
            images: true,
            examples: true,
          },
          skip: randomOffset,
          take: newWordsNeeded,
        });

        // If we didn't get enough (near end of list), get from beginning
        if (newWords.length < newWordsNeeded) {
          const moreWords = await prisma.word.findMany({
            where: {
              difficulty: currentLevel,
              userProgress: {
                none: { userId },
              },
              id: { notIn: newWords.map((w) => w.id) },
            },
            include: {
              audios: true,
              images: true,
              examples: true,
            },
            take: newWordsNeeded - newWords.length,
          });
          newWords = [...newWords, ...moreWords];
        }
      }
    }

    return { reviews: dueReviews, newWords };
  } catch (error) {
    console.error("getDailyVocabulary error:", error);
    throw new Error("Failed to fetch daily vocabulary");
  }
}

interface SubmitReviewParams {
  userId: string;
  wordId: string;
  quality: ReviewQuality;
}

interface SubmitReviewResult {
  success: boolean;
  nextReviewDate: Date;
  intervalDays: number;
  mastered: boolean;
}

export async function submitReview(
  params: SubmitReviewParams,
): Promise<SubmitReviewResult> {
  const { userId, wordId, quality } = params;

  try {
    // Get current progress or create if first review
    let progress = await prisma.userWordProgress.findUnique({
      where: {
        userId_wordId: { userId, wordId },
      },
    });

    if (!progress) {
      // First time encountering this word
      progress = await prisma.userWordProgress.create({
        data: {
          userId,
          wordId,
          easeFactor: 2.5,
          intervalDays: 0,
          repetitionCount: 0,
          nextReviewDate: new Date(),
        },
      });
    }

    // Calculate new SM-2 values
    const sm2Result = calculateSM2({
      quality,
      easeFactor: progress.easeFactor,
      intervalDays: progress.intervalDays,
      repetitionCount: progress.repetitionCount,
    });

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + sm2Result.intervalDays);

    // Update progress
    const updatedProgress = await prisma.userWordProgress.update({
      where: { id: progress.id },
      data: {
        easeFactor: sm2Result.easeFactor,
        intervalDays: sm2Result.intervalDays,
        repetitionCount: sm2Result.repetitionCount,
        nextReviewDate,
        lastReviewed: new Date(),
        mastered: sm2Result.intervalDays >= 21, // Mastered after 21+ days
      },
    });

    // Log the review
    await prisma.userWordReview.create({
      data: {
        userId,
        progressId: progress.id,
        quality,
        reviewedAt: new Date(),
      },
    });

    // Update daily activity (we'll implement this in progress service but call it here via a helper or direct db update)
    // For now, direct DB update to avoid circular dependency if we were to import progress service
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyActivity.upsert({
      where: {
        userId_date: { userId, date: today },
      },
      create: {
        userId,
        date: today,
        wordsReviewed: 1,
      },
      update: {
        wordsReviewed: { increment: 1 },
      },
    });

    return {
      success: true,
      nextReviewDate: updatedProgress.nextReviewDate,
      intervalDays: updatedProgress.intervalDays,
      mastered: updatedProgress.mastered,
    };
  } catch (error) {
    console.error("submitReview error:", error);
    throw new Error("Failed to submit vocabulary review");
  }
}

interface SM2Params {
  quality: ReviewQuality;
  easeFactor: number;
  intervalDays: number;
  repetitionCount: number;
}

interface SM2Result {
  easeFactor: number;
  intervalDays: number;
  repetitionCount: number;
}

function calculateSM2(params: SM2Params): SM2Result {
  const { quality, easeFactor, intervalDays, repetitionCount } = params;

  // Map ReviewQuality to SM-2 quality (0-5)
  const qualityMap = {
    [ReviewQuality.AGAIN]: 0,
    [ReviewQuality.HARD]: 3,
    [ReviewQuality.GOOD]: 4,
    [ReviewQuality.EASY]: 5,
  };

  const q = qualityMap[quality];

  // Calculate new ease factor
  let newEaseFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  // Minimum ease factor is 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  let newIntervalDays = 0;
  let newRepetitionCount = repetitionCount;

  if (q >= 3) {
    // Correct response
    if (repetitionCount === 0) {
      newIntervalDays = 1;
    } else if (repetitionCount === 1) {
      newIntervalDays = 6;
    } else {
      newIntervalDays = Math.round(intervalDays * newEaseFactor);
    }
    newRepetitionCount += 1;
  } else {
    // Incorrect response - reset
    newIntervalDays = 1;
    newRepetitionCount = 0;
  }

  return {
    easeFactor: newEaseFactor,
    intervalDays: newIntervalDays,
    repetitionCount: newRepetitionCount,
  };
}

interface GetVocabularyStatsParams {
  userId: string;
}

interface VocabularyStatsResult {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  dueReviews: number;
  accuracyRate: number;
}

export async function getVocabularyStats(
  params: GetVocabularyStatsParams,
): Promise<VocabularyStatsResult> {
  const { userId } = params;

  try {
    const [totalWords, masteredWords, dueReviews, recentReviews] =
      await Promise.all([
        prisma.userWordProgress.count({
          where: { userId },
        }),
        prisma.userWordProgress.count({
          where: { userId, mastered: true },
        }),
        prisma.userWordProgress.count({
          where: {
            userId,
            nextReviewDate: { lte: new Date() },
          },
        }),
        prisma.userWordReview.findMany({
          where: {
            userId,
            reviewedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          select: { quality: true },
        }),
      ]);

    // Calculate accuracy (GOOD or EASY reviews / total reviews)
    const goodReviews = recentReviews.filter(
      (r) =>
        r.quality === ReviewQuality.GOOD || r.quality === ReviewQuality.EASY,
    ).length;
    const accuracyRate =
      recentReviews.length > 0
        ? Math.round((goodReviews / recentReviews.length) * 100)
        : 0;

    return {
      totalWords,
      masteredWords,
      learningWords: totalWords - masteredWords,
      dueReviews,
      accuracyRate,
    };
  } catch (error) {
    console.error("getVocabularyStats error:", error);
    throw new Error("Failed to fetch vocabulary statistics");
  }
}

interface BrowseWordsParams {
  difficulty?: ProficiencyLevel;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function browseWords(params: BrowseWordsParams) {
  const { difficulty, categoryId, search, page = 1, limit = 20 } = params;

  try {
    const where: any = {};

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (categoryId) {
      where.categories = {
        some: { id: categoryId },
      };
    }

    if (search) {
      where.OR = [
        { word: { contains: search, mode: "insensitive" } },
        { translation: { contains: search, mode: "insensitive" } },
      ];
    }

    const [words, total] = await Promise.all([
      prisma.word.findMany({
        where,
        include: {
          examples: { take: 1 },
          categories: { select: { id: true, name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { word: "asc" },
      }),
      prisma.word.count({ where }),
    ]);

    return {
      words,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("browseWords error:", error);
    throw new Error("Failed to browse vocabulary");
  }
}

export async function getCategories() {
  try {
    const categories = await prisma.wordCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { words: true } },
      },
      cacheStrategy: { ttl: 3600 }, // Cache for 1 hour - static data
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      wordCount: cat._count.words,
    }));
  } catch (error) {
    console.error("getCategories error:", error);
    throw new Error("Failed to fetch categories");
  }
}

export async function getReviewSchedule(userId: string) {
  try {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Get all user word progress
    const progress = await prisma.userWordProgress.findMany({
      where: { userId },
      select: {
        id: true,
        nextReviewDate: true,
        intervalDays: true,
        mastered: true,
        repetitionCount: true,
        word: {
          select: {
            word: true,
            difficulty: true,
          },
        },
      },
      orderBy: { nextReviewDate: "asc" },
    });

    // Group by date for next 7 days
    const schedule: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      schedule[date.toISOString().split("T")[0]] = 0;
    }

    // Count due words per day
    let overdueCount = 0;
    let todayCount = 0;
    const upcomingWords: Array<{
      word: string;
      dueDate: string;
      interval: number;
      mastered: boolean;
    }> = [];

    for (const p of progress) {
      const dueDate = new Date(p.nextReviewDate);
      dueDate.setHours(0, 0, 0, 0);
      const dateKey = dueDate.toISOString().split("T")[0];

      if (dueDate < today) {
        overdueCount++;
      } else if (dueDate.getTime() === today.getTime()) {
        todayCount++;
      } else if (schedule[dateKey] !== undefined) {
        schedule[dateKey]++;
      }

      // Add to upcoming words list (first 20)
      if (upcomingWords.length < 20 && dueDate >= today) {
        upcomingWords.push({
          word: p.word.word,
          dueDate: dateKey,
          interval: p.intervalDays,
          mastered: p.mastered,
        });
      }
    }

    // Calculate mastery distribution
    const masteryStats = {
      new: progress.filter((p) => p.repetitionCount === 0).length,
      learning: progress.filter(
        (p) => p.repetitionCount > 0 && p.intervalDays < 21,
      ).length,
      mastered: progress.filter((p) => p.mastered).length,
    };

    // Interval distribution
    const intervalDistribution = {
      "1 day": progress.filter((p) => p.intervalDays === 1).length,
      "2-6 days": progress.filter(
        (p) => p.intervalDays >= 2 && p.intervalDays <= 6,
      ).length,
      "1-2 weeks": progress.filter(
        (p) => p.intervalDays >= 7 && p.intervalDays <= 14,
      ).length,
      "2-4 weeks": progress.filter(
        (p) => p.intervalDays >= 15 && p.intervalDays <= 28,
      ).length,
      "1+ month": progress.filter((p) => p.intervalDays > 28).length,
    };

    return {
      overdue: overdueCount,
      today: todayCount,
      schedule: Object.entries(schedule).map(([date, count]) => ({
        date,
        count,
      })),
      upcomingWords,
      masteryStats,
      intervalDistribution,
      totalLearning: progress.length,
    };
  } catch (error) {
    console.error("getReviewSchedule error:", error);
    throw new Error("Failed to fetch review schedule");
  }
}

import type { ProficiencyLevel } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

interface CreateStudySessionParams {
  userId: string;
  difficulty?: ProficiencyLevel;
  categoryId?: string;
  wordCount: number;
  includeNew?: boolean;
  includeReview?: boolean;
}

export async function createCustomStudySession(
  params: CreateStudySessionParams,
) {
  const {
    userId,
    difficulty,
    categoryId,
    wordCount,
    includeNew = true,
    includeReview = true,
  } = params;

  try {
    const words: Array<{
      id: string;
      word: string;
      translation: string;
      phonetic: string | null;
      difficulty: ProficiencyLevel;
      definition: string;
      audios: Array<{ url: string }>;
      images: Array<{ url: string }>;
      examples: Array<{
        sentence: string;
        translation: string;
        highlight: string;
      }>;
      isReview: boolean;
    }> = [];

    // Get review words first (overdue + due today)
    if (includeReview) {
      const now = new Date();
      const reviewWords = await prisma.userWordProgress.findMany({
        where: {
          userId,
          nextReviewDate: { lte: now },
          word: {
            difficulty: difficulty || undefined,
            categories: categoryId ? { some: { id: categoryId } } : undefined,
          },
        },
        include: {
          word: {
            select: {
              id: true,
              word: true,
              translation: true,
              phonetic: true,
              difficulty: true,
              definition: true,
              audios: { select: { url: true } },
              images: { select: { url: true } },
              examples: {
                select: { sentence: true, translation: true, highlight: true },
              },
            },
          },
        },
        orderBy: { nextReviewDate: "asc" },
        take: wordCount,
      });

      for (const progress of reviewWords) {
        words.push({
          ...progress.word,
          isReview: true,
        });
      }
    }

    // Fill remaining with new words
    if (includeNew && words.length < wordCount) {
      const remaining = wordCount - words.length;
      const existingWordIds = words.map((w) => w.id);

      // Get words not yet learned by user
      const newWords = await prisma.word.findMany({
        where: {
          difficulty: difficulty || undefined,
          categories: categoryId ? { some: { id: categoryId } } : undefined,
          id: { notIn: existingWordIds },
          userProgress: {
            none: { userId },
          },
        },
        select: {
          id: true,
          word: true,
          translation: true,
          phonetic: true,
          difficulty: true,
          definition: true,
          audios: { select: { url: true } },
          images: { select: { url: true } },
          examples: {
            select: { sentence: true, translation: true, highlight: true },
          },
        },
        take: remaining,
      });

      for (const word of newWords) {
        words.push({
          ...word,
          isReview: false,
        });
      }
    }

    // Log the study session
    await prisma.studySession.create({
      data: {
        userId,
        module: "vocabulary",
        duration: 0, // Will be updated when session ends
      },
    });

    return {
      words,
      totalReview: words.filter((w) => w.isReview).length,
      totalNew: words.filter((w) => !w.isReview).length,
    };
  } catch (error) {
    console.error("createCustomStudySession error:", error);
    throw new Error("Failed to create study session");
  }
}

export async function getStudySessionOptions(userId: string) {
  try {
    const now = new Date();

    // Count available words by type
    const [dueReviewCount, newWordsCount, categories] = await Promise.all([
      prisma.userWordProgress.count({
        where: {
          userId,
          nextReviewDate: { lte: now },
        },
      }),
      prisma.word.count({
        where: {
          userProgress: {
            none: { userId },
          },
        },
      }),
      prisma.wordCategory.findMany({
        select: {
          id: true,
          name: true,
          _count: { select: { words: true } },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      dueReviewCount,
      newWordsCount,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        wordCount: c._count.words,
      })),
      levels: ["A1", "A2", "B1", "B2", "C1", "C2"] as ProficiencyLevel[],
    };
  } catch (error) {
    console.error("getStudySessionOptions error:", error);
    throw new Error("Failed to fetch study session options");
  }
}

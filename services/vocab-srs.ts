import { MasteryLevel } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

interface SM2Params {
  quality: number; // 0-5
  easeFactor: number;
  intervalDays: number;
  repetitionCount: number;
}

interface SM2Result {
  easeFactor: number;
  intervalDays: number;
  repetitionCount: number;
  masteryLevel: MasteryLevel;
}

/**
 * SuperMemo-2 Algorithm Implementation
 *
 * Quality ratings:
 * 0 - Complete blackout, no recall
 * 1 - Incorrect, but upon seeing correct answer, remembered
 * 2 - Incorrect, but correct answer seemed easy to recall
 * 3 - Correct with serious difficulty
 * 4 - Correct after hesitation
 * 5 - Perfect response
 */
export function calculateSM2(params: SM2Params): SM2Result {
  const { quality, easeFactor, intervalDays, repetitionCount } = params;

  let newEaseFactor = easeFactor;
  let newIntervalDays = intervalDays;
  let newRepetitionCount = repetitionCount;

  // Update ease factor based on quality
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  newEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Minimum ease factor is 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  if (quality >= 3) {
    // Correct response
    if (repetitionCount === 0) {
      newIntervalDays = 1;
    } else if (repetitionCount === 1) {
      newIntervalDays = 6;
    } else {
      newIntervalDays = Math.round(intervalDays * newEaseFactor);
    }
    newRepetitionCount = repetitionCount + 1;
  } else {
    // Incorrect response - reset
    newIntervalDays = 1;
    newRepetitionCount = 0;
  }

  // Determine mastery level based on interval and repetitions
  const masteryLevel = getMasteryLevel({
    intervalDays: newIntervalDays,
    repetitionCount: newRepetitionCount,
  });

  return {
    easeFactor: newEaseFactor,
    intervalDays: newIntervalDays,
    repetitionCount: newRepetitionCount,
    masteryLevel,
  };
}

interface GetMasteryLevelParams {
  intervalDays: number;
  repetitionCount: number;
}

export function getMasteryLevel(params: GetMasteryLevelParams): MasteryLevel {
  const { intervalDays, repetitionCount } = params;

  if (repetitionCount === 0) {
    return MasteryLevel.NEW;
  }

  if (intervalDays >= 21) {
    return MasteryLevel.MASTERED;
  }

  if (intervalDays >= 7) {
    return MasteryLevel.REVIEW;
  }

  return MasteryLevel.LEARNING;
}

interface SubmitReviewParams {
  cardId: string;
  quality: number; // 0-5
}

interface SubmitReviewResult {
  success: boolean;
  card: {
    id: string;
    word: string;
    masteryLevel: MasteryLevel;
    nextReviewDate: Date;
    intervalDays: number;
  };
}

export async function submitReview(
  params: SubmitReviewParams
): Promise<SubmitReviewResult> {
  const { cardId, quality } = params;

  // Get current card state
  const card = await prisma.vocabCard.findUnique({
    where: { id: cardId },
  });

  if (!card) {
    throw new Error("Card not found");
  }

  // Calculate new SM-2 values
  const sm2Result = calculateSM2({
    quality,
    easeFactor: card.easeFactor,
    intervalDays: card.intervalDays,
    repetitionCount: card.repetitionCount,
  });

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + sm2Result.intervalDays);

  // Update card in transaction
  const [updatedCard] = await prisma.$transaction([
    prisma.vocabCard.update({
      where: { id: cardId },
      data: {
        easeFactor: sm2Result.easeFactor,
        intervalDays: sm2Result.intervalDays,
        repetitionCount: sm2Result.repetitionCount,
        masteryLevel: sm2Result.masteryLevel,
        nextReviewDate,
        lastReviewedAt: new Date(),
      },
    }),
    prisma.vocabReviewLog.create({
      data: {
        cardId,
        quality,
        reviewedAt: new Date(),
      },
    }),
  ]);

  return {
    success: true,
    card: {
      id: updatedCard.id,
      word: updatedCard.word,
      masteryLevel: updatedCard.masteryLevel,
      nextReviewDate: updatedCard.nextReviewDate,
      intervalDays: updatedCard.intervalDays,
    },
  };
}

/**
 * Get review statistics for a user
 */
export async function getReviewStats(userId: string) {
  const now = new Date();

  const [dueCards, totalCards, masteredCards, recentReviews] =
    await Promise.all([
      prisma.vocabCard.count({
        where: {
          category: { userId },
          nextReviewDate: { lte: now },
        },
      }),
      prisma.vocabCard.count({
        where: { category: { userId } },
      }),
      prisma.vocabCard.count({
        where: {
          category: { userId },
          masteryLevel: MasteryLevel.MASTERED,
        },
      }),
      prisma.vocabReviewLog.findMany({
        where: {
          card: { category: { userId } },
          reviewedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: { quality: true },
      }),
    ]);

  // Calculate accuracy (quality >= 3 means correct)
  const correctReviews = recentReviews.filter((r) => r.quality >= 3).length;
  const accuracyRate =
    recentReviews.length > 0
      ? Math.round((correctReviews / recentReviews.length) * 100)
      : 0;

  return {
    dueCards,
    totalCards,
    masteredCards,
    learningCards: totalCards - masteredCards,
    accuracyRate,
    reviewsThisWeek: recentReviews.length,
  };
}

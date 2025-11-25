import { ProficiencyLevel } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

interface GetPassageParams {
  userId: string;
  level?: ProficiencyLevel;
}

export async function getPassageByLevel(params: GetPassageParams) {
  const { userId, level } = params;

  try {
    // If level not provided, get from user profile
    let targetLevel = level;
    if (!targetLevel) {
      const profile = await prisma.userProfile.findUnique({
        where: { userId },
        select: { currentLevel: true },
      });
      targetLevel = profile?.currentLevel || ProficiencyLevel.A1;
    }

    // Find a passage not yet completed by user
    const completedPassageIds = await prisma.userReadingProgress.findMany({
      where: { userId, completed: true },
      select: { passageId: true },
    });

    const completedIds = completedPassageIds.map((p) => p.passageId);

    const passage = await prisma.readingPassage.findFirst({
      where: {
        difficulty: targetLevel,
        id: { notIn: completedIds },
      },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            question: true,
            options: true,
            orderIndex: true,
            // Hide answer
          },
        },
      },
    });

    return passage;
  } catch (error) {
    console.error("getPassageByLevel error:", error);
    throw new Error("Failed to fetch reading passage");
  }
}

interface SubmitReadingParams {
  userId: string;
  passageId: string;
  answers: Record<string, string>;
  readingTimeSeconds: number;
}

export async function submitReadingAnswers(params: SubmitReadingParams) {
  const { userId, passageId, answers, readingTimeSeconds } = params;

  try {
    const passage = await prisma.readingPassage.findUnique({
      where: { id: passageId },
      include: { questions: true },
    });

    if (!passage) {
      throw new Error("Passage not found");
    }

    let correctCount = 0;
    passage.questions.forEach((q) => {
      if (answers[q.id] === q.answer) correctCount++;
    });

    const score = Math.round((correctCount / passage.questions.length) * 100);
    const completed = score >= 70;

    // Calculate WPM
    const wordsPerMinute = Math.round(
      (passage.wordCount / readingTimeSeconds) * 60,
    );

    await prisma.userReadingProgress.upsert({
      where: {
        userId_passageId: { userId, passageId },
      },
      create: {
        userId,
        passageId,
        completed,
        answers,
        score,
        readingTime: readingTimeSeconds,
        wordsPerMinute,
        completedAt: completed ? new Date() : null,
      },
      update: {
        completed: completed || undefined,
        answers,
        score,
        readingTime: readingTimeSeconds,
        wordsPerMinute,
        completedAt: completed ? new Date() : undefined,
      },
    });

    // Update daily activity
    if (completed) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.dailyActivity.upsert({
        where: {
          userId_date: { userId, date: today },
        },
        create: {
          userId,
          date: today,
          readingCount: 1,
        },
        update: {
          readingCount: { increment: 1 },
        },
      });
    }

    return { score, completed, wordsPerMinute };
  } catch (error) {
    console.error("submitReadingAnswers error:", error);
    throw new Error("Failed to submit reading answers");
  }
}

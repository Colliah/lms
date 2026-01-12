import type { ProficiencyLevel } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

interface GetExercisesByTopicParams {
  topicId: string;
  difficulty?: ProficiencyLevel;
}

export async function getExercisesByTopic(params: GetExercisesByTopicParams) {
  const { topicId, difficulty } = params;

  try {
    return await prisma.grammarExercise.findMany({
      where: {
        topicId,
        ...(difficulty ? { difficulty } : {}),
      },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            type: true,
            question: true,
            options: true,
            orderIndex: true,
            // Don't include correctAnswer or explanation here
          },
        },
      },
    });
  } catch (error) {
    console.error("getExercisesByTopic error:", error);
    throw new Error("Failed to fetch grammar exercises");
  }
}

interface SubmitExerciseParams {
  userId: string;
  exerciseId: string;
  answers: Record<string, string>; // questionId -> answer
}

interface SubmitExerciseResult {
  score: number;
  feedback: Record<
    string,
    { isCorrect: boolean; explanation: string; correctAnswer: string }
  >;
  completed: boolean;
}

export async function submitExercise(
  params: SubmitExerciseParams,
): Promise<SubmitExerciseResult> {
  const { userId, exerciseId, answers } = params;

  try {
    const exercise = await prisma.grammarExercise.findUnique({
      where: { id: exerciseId },
      include: { questions: true },
    });

    if (!exercise) {
      throw new Error("Exercise not found");
    }

    let correctCount = 0;
    const feedback: Record<
      string,
      { isCorrect: boolean; explanation: string; correctAnswer: string }
    > = {};

    exercise.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) correctCount++;

      feedback[question.id] = {
        isCorrect,
        explanation: question.explanation,
        correctAnswer: question.correctAnswer,
      };
    });

    const score = Math.round((correctCount / exercise.questions.length) * 100);
    const completed = score >= 70; // 70% pass mark

    // Save submission
    await prisma.userGrammarSubmission.create({
      data: {
        userId,
        exerciseId,
        answers,
        score,
        feedback,
      },
    });

    // Update progress
    await prisma.userGrammarProgress.upsert({
      where: {
        userId_exerciseId: { userId, exerciseId },
      },
      create: {
        userId,
        exerciseId,
        completed,
        score,
        attemptsCount: 1,
        lastAttemptAt: new Date(),
      },
      update: {
        completed: completed || undefined, // Only update if true or keep existing
        score, // Update with latest score
        attemptsCount: { increment: 1 },
        lastAttemptAt: new Date(),
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
        exercisesCount: 1,
      },
      update: {
        exercisesCount: { increment: 1 },
      },
    });

    return { score, feedback, completed };
  } catch (error) {
    console.error("submitExercise error:", error);
    throw new Error("Failed to submit grammar exercise");
  }
}

export async function getGrammarProgress(userId: string) {
  try {
    const progress = await prisma.userGrammarProgress.findMany({
      where: { userId },
      include: {
        exercise: {
          select: {
            title: true,
            topic: { select: { name: true } },
          },
        },
      },
    });

    return progress;
  } catch (error) {
    console.error("getGrammarProgress error:", error);
    throw new Error("Failed to fetch grammar progress");
  }
}

export async function getAllTopics(userId?: string) {
  try {
    const topics = await prisma.grammarTopic.findMany({
      orderBy: { difficulty: "asc" },
      include: {
        _count: {
          select: { exercises: true },
        },
        exercises: {
          select: {
            _count: {
              select: { questions: true },
            },
          },
        },
      },
      cacheStrategy: { ttl: 1800 }, // Cache for 30 min - semi-static data
    });

    // If userId provided, get progress for each topic
    const progressMap: Record<string, { completed: number; total: number }> =
      {};

    if (userId) {
      const progress = await prisma.userGrammarProgress.findMany({
        where: { userId },
        include: {
          exercise: {
            select: { topicId: true },
          },
        },
      });

      progress.forEach((p) => {
        const topicId = p.exercise.topicId;
        if (!progressMap[topicId]) {
          progressMap[topicId] = { completed: 0, total: 0 };
        }
        if (p.completed) {
          progressMap[topicId].completed++;
        }
      });
    }

    return topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      description: topic.description,
      difficulty: topic.difficulty,
      exerciseCount: topic._count.exercises,
      questionCount: topic.exercises.reduce(
        (sum, ex) => sum + ex._count.questions,
        0,
      ),
      userProgress: progressMap[topic.id] || null,
    }));
  } catch (error) {
    console.error("getAllTopics error:", error);
    throw new Error("Failed to fetch grammar topics");
  }
}

import type { ProficiencyLevel } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

interface LearningRecommendation {
  type: "vocabulary" | "grammar" | "reading";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  action: string;
  actionUrl: string;
  reason: string;
}

interface LearningPathResult {
  recommendations: LearningRecommendation[];
  focusAreas: string[];
  suggestedDailyGoals: {
    vocabulary: number;
    grammar: number;
    reading: number;
  };
  currentLevel: ProficiencyLevel;
  progressToNextLevel: number;
}

export async function generateLearningPath(
  userId: string,
): Promise<LearningPathResult> {
  try {
    // Get user profile for current level
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    const currentLevel = profile?.currentLevel || "A1";
    const recommendations: LearningRecommendation[] = [];
    const focusAreas: string[] = [];

    // 1. Analyze vocabulary progress
    const vocabStats = await analyzeVocabularyForPath(userId, currentLevel);
    recommendations.push(...vocabStats.recommendations);
    if (vocabStats.needsFocus) focusAreas.push("vocabulary");

    // 2. Analyze grammar progress
    const grammarStats = await analyzeGrammarForPath(userId, currentLevel);
    recommendations.push(...grammarStats.recommendations);
    if (grammarStats.needsFocus) focusAreas.push("grammar");

    // 3. Analyze reading progress
    const readingStats = await analyzeReadingForPath(userId, currentLevel);
    recommendations.push(...readingStats.recommendations);
    if (readingStats.needsFocus) focusAreas.push("reading");

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
    );

    // Calculate progress to next level
    const progressToNextLevel = await calculateLevelProgress(
      userId,
      currentLevel,
    );

    // Suggested daily goals based on weakness areas
    const suggestedDailyGoals = {
      vocabulary: focusAreas.includes("vocabulary") ? 15 : 10,
      grammar: focusAreas.includes("grammar") ? 2 : 1,
      reading: focusAreas.includes("reading") ? 2 : 1,
    };

    // Store learning path
    await prisma.learningPath.upsert({
      where: { id: `${userId}-current` },
      create: {
        id: `${userId}-current`,
        userId,
        recommendations: recommendations as object[],
        priority: focusAreas,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      update: {
        recommendations: recommendations as object[],
        priority: focusAreas,
        generatedAt: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      recommendations: recommendations.slice(0, 6),
      focusAreas,
      suggestedDailyGoals,
      currentLevel,
      progressToNextLevel,
    };
  } catch (error) {
    console.error("generateLearningPath error:", error);
    throw new Error("Failed to generate learning path");
  }
}

async function analyzeVocabularyForPath(
  userId: string,
  level: ProficiencyLevel,
) {
  const recommendations: LearningRecommendation[] = [];
  let needsFocus = false;

  // Check due reviews
  const dueCount = await prisma.userWordProgress.count({
    where: {
      userId,
      nextReviewDate: { lte: new Date() },
    },
  });

  if (dueCount > 0) {
    recommendations.push({
      type: "vocabulary",
      priority: dueCount > 20 ? "high" : "medium",
      title: `Review ${dueCount} Due Words`,
      description: `You have ${dueCount} words waiting for review`,
      action: "Start Review",
      actionUrl: "/vocabulary",
      reason: "Spaced repetition works best with consistent reviews",
    });
    if (dueCount > 20) needsFocus = true;
  }

  // Check if new words at current level available
  const newWordsAvailable = await prisma.word.count({
    where: {
      difficulty: level,
      userProgress: { none: { userId } },
    },
  });

  if (newWordsAvailable > 0 && dueCount < 10) {
    recommendations.push({
      type: "vocabulary",
      priority: "medium",
      title: `Learn ${level} Vocabulary`,
      description: `${newWordsAvailable} new words available at your level`,
      action: "Learn New Words",
      actionUrl: "/vocabulary?tab=custom",
      reason: "Expand your vocabulary at the current level",
    });
  }

  // Check mastery rate
  const [total, mastered] = await Promise.all([
    prisma.userWordProgress.count({ where: { userId } }),
    prisma.userWordProgress.count({ where: { userId, mastered: true } }),
  ]);

  if (total > 0 && mastered / total < 0.3) {
    needsFocus = true;
  }

  return { recommendations, needsFocus };
}

async function analyzeGrammarForPath(userId: string, level: ProficiencyLevel) {
  const recommendations: LearningRecommendation[] = [];
  let needsFocus = false;

  // Get incomplete exercises at current level
  const incompleteExercises = await prisma.grammarExercise.findMany({
    where: {
      difficulty: level,
      progress: {
        none: {
          userId,
          completed: true,
        },
      },
    },
    include: { topic: true },
    take: 3,
  });

  if (incompleteExercises.length > 0) {
    const exercise = incompleteExercises[0];
    recommendations.push({
      type: "grammar",
      priority: "medium",
      title: `Practice: ${exercise.topic.name}`,
      description: exercise.title,
      action: "Start Exercise",
      actionUrl: `/grammar?topicId=${exercise.topicId}`,
      reason: `Strengthen your ${level} grammar skills`,
    });
  }

  // Check for low-scoring topics
  const lowScoreSubmissions = await prisma.userGrammarSubmission.findMany({
    where: {
      userId,
      score: { lt: 70 },
    },
    include: {
      exercise: { include: { topic: true } },
    },
    orderBy: { submittedAt: "desc" },
    take: 5,
  });

  if (lowScoreSubmissions.length >= 2) {
    const topic = lowScoreSubmissions[0].exercise.topic;
    recommendations.push({
      type: "grammar",
      priority: "high",
      title: `Review: ${topic.name}`,
      description: "You struggled with this topic recently",
      action: "Practice Again",
      actionUrl: `/grammar?topicId=${topic.id}`,
      reason: "Repetition helps solidify grammar rules",
    });
    needsFocus = true;
  }

  return { recommendations, needsFocus };
}

async function analyzeReadingForPath(userId: string, level: ProficiencyLevel) {
  const recommendations: LearningRecommendation[] = [];
  let needsFocus = false;

  // Get unread passages at current level
  const unreadPassages = await prisma.readingPassage.findMany({
    where: {
      difficulty: level,
      progress: {
        none: {
          userId,
          completed: true,
        },
      },
    },
    take: 3,
  });

  if (unreadPassages.length > 0) {
    const passage = unreadPassages[0];
    recommendations.push({
      type: "reading",
      priority: "low",
      title: `Read: ${passage.title}`,
      description: `${passage.wordCount} words • ${passage.topics.join(", ")}`,
      action: "Start Reading",
      actionUrl: `/reading/${passage.id}`,
      reason: "Daily reading improves comprehension",
    });
  }

  // Check reading comprehension scores
  const recentScores = await prisma.userReadingProgress.findMany({
    where: {
      userId,
      score: { not: null },
    },
    orderBy: { completedAt: "desc" },
    take: 5,
  });

  if (recentScores.length >= 3) {
    const avgScore =
      recentScores.reduce((sum, p) => sum + (p.score || 0), 0) /
      recentScores.length;
    if (avgScore < 70) {
      needsFocus = true;
      recommendations.push({
        type: "reading",
        priority: "medium",
        title: "Improve Reading Comprehension",
        description: "Your recent scores suggest room for improvement",
        action: "Practice Reading",
        actionUrl: "/reading",
        reason: "Try easier passages and read more carefully",
      });
    }
  }

  return { recommendations, needsFocus };
}

async function calculateLevelProgress(
  userId: string,
  level: ProficiencyLevel,
): Promise<number> {
  // Count completed items at current level
  const [vocabMastered, grammarCompleted, readingCompleted] = await Promise.all(
    [
      prisma.userWordProgress.count({
        where: { userId, mastered: true, word: { difficulty: level } },
      }),
      prisma.userGrammarProgress.count({
        where: { userId, completed: true, exercise: { difficulty: level } },
      }),
      prisma.userReadingProgress.count({
        where: { userId, completed: true, passage: { difficulty: level } },
      }),
    ],
  );

  // Simple progress calculation (each component worth ~33%)
  const vocabProgress = Math.min(100, (vocabMastered / 50) * 100);
  const grammarProgress = Math.min(100, (grammarCompleted / 10) * 100);
  const readingProgress = Math.min(100, (readingCompleted / 5) * 100);

  return Math.round((vocabProgress + grammarProgress + readingProgress) / 3);
}

export async function getStoredLearningPath(userId: string) {
  try {
    const path = await prisma.learningPath.findFirst({
      where: {
        userId,
        validUntil: { gte: new Date() },
      },
      orderBy: { generatedAt: "desc" },
    });

    return path;
  } catch (error) {
    console.error("getStoredLearningPath error:", error);
    return null;
  }
}

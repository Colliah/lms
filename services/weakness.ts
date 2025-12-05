import type { ProficiencyLevel } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

interface WeaknessAreaResult {
  category: string;
  specificArea: string;
  severity: number; // 1-10
  suggestions: string[];
  stats: {
    total: number;
    failed: number;
    accuracy: number;
  };
}

export async function identifyWeaknesses(
  userId: string,
): Promise<WeaknessAreaResult[]> {
  try {
    const weaknesses: WeaknessAreaResult[] = [];

    // 1. Analyze vocabulary weaknesses by difficulty level
    const vocabByLevel = await analyzeVocabularyByLevel(userId);
    weaknesses.push(...vocabByLevel);

    // 2. Analyze grammar weaknesses by topic
    const grammarWeaknesses = await analyzeGrammarTopics(userId);
    weaknesses.push(...grammarWeaknesses);

    // 3. Analyze reading comprehension
    const readingWeaknesses = await analyzeReading(userId);
    weaknesses.push(...readingWeaknesses);

    // Sort by severity (highest first)
    weaknesses.sort((a, b) => b.severity - a.severity);

    // Store/update weaknesses in database
    for (const weakness of weaknesses.slice(0, 5)) {
      await prisma.weaknessArea.upsert({
        where: {
          id: `${userId}-${weakness.category}-${weakness.specificArea}`.replace(
            /\s+/g,
            "_",
          ),
        },
        create: {
          id: `${userId}-${weakness.category}-${weakness.specificArea}`.replace(
            /\s+/g,
            "_",
          ),
          userId,
          category: weakness.category,
          specificArea: weakness.specificArea,
          severity: weakness.severity,
          suggestions: weakness.suggestions,
        },
        update: {
          severity: weakness.severity,
          suggestions: weakness.suggestions,
          resolvedAt: weakness.severity <= 3 ? new Date() : null,
        },
      });
    }

    return weaknesses;
  } catch (error) {
    console.error("identifyWeaknesses error:", error);
    throw new Error("Failed to identify weaknesses");
  }
}

async function analyzeVocabularyByLevel(
  userId: string,
): Promise<WeaknessAreaResult[]> {
  const levels: ProficiencyLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const results: WeaknessAreaResult[] = [];

  for (const level of levels) {
    const [total, failed] = await Promise.all([
      prisma.userWordProgress.count({
        where: {
          userId,
          word: { difficulty: level },
          repetitionCount: { gt: 0 },
        },
      }),
      prisma.userWordProgress.count({
        where: {
          userId,
          word: { difficulty: level },
          repetitionCount: { gt: 0 },
          easeFactor: { lt: 2.0 }, // Low ease factor = struggled
        },
      }),
    ]);

    if (total >= 5) {
      const accuracy =
        total > 0 ? Math.round(((total - failed) / total) * 100) : 100;
      const severity = Math.min(
        10,
        Math.max(1, Math.round((100 - accuracy) / 10)),
      );

      if (severity >= 4) {
        results.push({
          category: "vocabulary",
          specificArea: `${level} Level Words`,
          severity,
          suggestions: [
            `Review ${level} vocabulary more frequently`,
            "Focus on words with low ease factor",
            "Use flashcard 'Again' button less - try to recall before revealing",
          ],
          stats: { total, failed, accuracy },
        });
      }
    }
  }

  return results;
}

async function analyzeGrammarTopics(
  userId: string,
): Promise<WeaknessAreaResult[]> {
  const results: WeaknessAreaResult[] = [];

  // Get all grammar submissions grouped by topic
  const submissions = await prisma.userGrammarSubmission.findMany({
    where: { userId },
    include: {
      exercise: {
        include: { topic: true },
      },
    },
    orderBy: { submittedAt: "desc" },
    take: 100,
  });

  // Group by topic
  const topicStats: Record<
    string,
    { total: number; scores: number[]; name: string }
  > = {};

  for (const sub of submissions) {
    const topicId = sub.exercise.topicId;
    const topicName = sub.exercise.topic.name;

    if (!topicStats[topicId]) {
      topicStats[topicId] = { total: 0, scores: [], name: topicName };
    }
    topicStats[topicId].total++;
    topicStats[topicId].scores.push(sub.score);
  }

  // Analyze each topic
  for (const [_topicId, stats] of Object.entries(topicStats)) {
    if (stats.total >= 3) {
      const avgScore = Math.round(
        stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length,
      );
      const severity = Math.min(
        10,
        Math.max(1, Math.round((100 - avgScore) / 10)),
      );

      if (severity >= 4) {
        results.push({
          category: "grammar",
          specificArea: stats.name,
          severity,
          suggestions: [
            `Review ${stats.name} grammar rules`,
            "Practice more exercises on this topic",
            "Read the explanations after each question",
          ],
          stats: {
            total: stats.total,
            failed: stats.scores.filter((s) => s < 70).length,
            accuracy: avgScore,
          },
        });
      }
    }
  }

  return results;
}

async function analyzeReading(userId: string): Promise<WeaknessAreaResult[]> {
  const results: WeaknessAreaResult[] = [];

  // Get reading progress grouped by difficulty
  const levels: ProficiencyLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

  for (const level of levels) {
    const progress = await prisma.userReadingProgress.findMany({
      where: {
        userId,
        passage: { difficulty: level },
        score: { not: null },
      },
      select: { score: true },
    });

    if (progress.length >= 2) {
      const scores = progress.map((p) => p.score as number);
      const avgScore = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length,
      );
      const severity = Math.min(
        10,
        Math.max(1, Math.round((100 - avgScore) / 10)),
      );

      if (severity >= 4) {
        results.push({
          category: "reading",
          specificArea: `${level} Comprehension`,
          severity,
          suggestions: [
            `Practice more ${level} level passages`,
            "Read more carefully before answering",
            "Try re-reading difficult passages",
          ],
          stats: {
            total: progress.length,
            failed: scores.filter((s) => s < 70).length,
            accuracy: avgScore,
          },
        });
      }
    }
  }

  return results;
}

export async function getStoredWeaknesses(userId: string) {
  try {
    const weaknesses = await prisma.weaknessArea.findMany({
      where: {
        userId,
        resolvedAt: null,
      },
      orderBy: { severity: "desc" },
      take: 10,
    });

    return weaknesses;
  } catch (error) {
    console.error("getStoredWeaknesses error:", error);
    throw new Error("Failed to fetch weaknesses");
  }
}

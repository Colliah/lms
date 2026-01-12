import {
  ProficiencyLevel,
  type WritingType,
} from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

interface GetWritingPromptParams {
  userId: string;
  type?: WritingType;
}

export async function getWritingPrompt(params: GetWritingPromptParams) {
  const { userId, type } = params;

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { currentLevel: true },
    });
    const level = profile?.currentLevel || ProficiencyLevel.A1;

    // Get random prompt for level
    const prompt = await prisma.writingPrompt.findFirst({
      where: {
        difficulty: level,
        ...(type ? { type } : {}),
      },
      // In real app, might want random selection logic
    });

    return prompt;
  } catch (error) {
    console.error("getWritingPrompt error:", error);
    throw new Error("Failed to fetch writing prompt");
  }
}

interface SubmitWritingParams {
  userId: string;
  promptId: string;
  content: string;
}

export async function submitWriting(params: SubmitWritingParams) {
  const { userId, promptId, content } = params;

  try {
    const wordCount = content.trim().split(/\s+/).length;

    const submission = await prisma.userWriting.create({
      data: {
        userId,
        promptId,
        content,
        wordCount,
      },
    });

    // Placeholder for AI feedback generation
    // In a real implementation, this would call an AI service
    await prisma.writingFeedback.create({
      data: {
        writingId: submission.id,
        grammarScore: 85, // Placeholder
        vocabularyScore: 80, // Placeholder
        structureScore: 75, // Placeholder
        overallScore: 80, // Placeholder
        grammarErrors: [],
        suggestions: ["Good job! Try using more complex sentence structures."],
        strengths: ["Clear expression", "Good vocabulary"],
        weaknesses: ["Simple sentence structure"],
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
        writingCount: 1,
      },
      update: {
        writingCount: { increment: 1 },
      },
    });

    return submission;
  } catch (error) {
    console.error("submitWriting error:", error);
    throw new Error("Failed to submit writing");
  }
}

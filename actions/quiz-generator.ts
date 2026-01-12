"use server";

import { QuizGeneratorService } from "@/lib/quiz-generator";

export async function generateQuizAction(
  topic: string,
  level: "A" | "B" | "C" = "B",
  type: "Multiple Choice" | "Fill-in-the-blank" = "Multiple Choice",
) {
  try {
    const questions = await QuizGeneratorService.generateExercise(
      topic,
      level,
      type,
    );
    return { success: true, data: questions };
  } catch (error) {
    console.error("generateQuizAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate quiz",
    };
  }
}

export async function generateTOEICAction(
  part: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  quantity: number,
) {
  try {
    const questions = await QuizGeneratorService.generateTOEICPart(
      part,
      quantity,
    );
    return { success: true, data: questions };
  } catch (error) {
    console.error("generateTOEICAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate TOEIC questions",
    };
  }
}

export async function generateTheoryAction(topic: string) {
  try {
    const content = await QuizGeneratorService.generateTheoryContent(topic);
    return { success: true, data: content };
  } catch (error) {
    console.error("generateTheoryAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate theory content",
    };
  }
}

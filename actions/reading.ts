"use server";

import { headers } from "next/headers";
import type { ProficiencyLevel } from "@/app/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { getPassageByLevel, submitReadingAnswers } from "@/services/reading";

export async function fetchReadingPassageAction(data?: {
  level?: ProficiencyLevel;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await getPassageByLevel({
      userId: session.user.id,
      level: data?.level,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("fetchReadingPassageAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch passage",
    };
  }
}

export async function submitReadingAnswersAction(data: {
  passageId: string;
  answers: Record<string, string>;
  readingTimeSeconds: number;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await submitReadingAnswers({
      userId: session.user.id,
      passageId: data.passageId,
      answers: data.answers,
      readingTimeSeconds: data.readingTimeSeconds,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("submitReadingAnswersAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to submit answers",
    };
  }
}

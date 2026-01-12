"use server";

import { headers } from "next/headers";
import type { ProficiencyLevel } from "@/app/generated/prisma/enums";
import { auth } from "@/lib/auth";
import {
  getAllTopics,
  getExercisesByTopic,
  getGrammarProgress,
  submitExercise,
} from "@/services/grammar";

export async function fetchGrammarExercisesAction(data: {
  topicId: string;
  difficulty?: ProficiencyLevel;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await getExercisesByTopic({
      topicId: data.topicId,
      difficulty: data.difficulty,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("fetchGrammarExercisesAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch exercises",
    };
  }
}

export async function submitGrammarExerciseAction(data: {
  exerciseId: string;
  answers: Record<string, string>;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await submitExercise({
      userId: session.user.id,
      exerciseId: data.exerciseId,
      answers: data.answers,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("submitGrammarExerciseAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to submit exercise",
    };
  }
}

export async function getGrammarProgressAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await getGrammarProgress(session.user.id);
    return { success: true, data: result };
  } catch (error) {
    console.error("getGrammarProgressAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch progress",
    };
  }
}

export async function fetchAllTopicsAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    const result = await getAllTopics(userId);
    return { success: true, data: result };
  } catch (error) {
    console.error("fetchAllTopicsAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch topics",
    };
  }
}

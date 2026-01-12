"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  generateLearningPath,
  getStoredLearningPath,
} from "@/services/learning-path";

export async function generateLearningPathAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await generateLearningPath(session.user.id);
    return { success: true, data: result };
  } catch (error) {
    console.error("generateLearningPathAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate learning path",
    };
  }
}

export async function getLearningPathAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Try to get stored path first
    const stored = await getStoredLearningPath(session.user.id);

    if (stored) {
      return { success: true, data: stored };
    }

    // Generate new path if none exists
    const result = await generateLearningPath(session.user.id);
    return { success: true, data: result };
  } catch (error) {
    console.error("getLearningPathAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get learning path",
    };
  }
}

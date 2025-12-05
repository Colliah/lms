"use server";

import { headers } from "next/headers";
import type { ProficiencyLevel } from "@/app/generated/prisma/enums";
import { auth } from "@/lib/auth";
import {
  createCustomStudySession,
  getStudySessionOptions,
} from "@/services/study-session";

export async function createStudySessionAction(data: {
  difficulty?: ProficiencyLevel;
  categoryId?: string;
  wordCount: number;
  includeNew?: boolean;
  includeReview?: boolean;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await createCustomStudySession({
      userId: session.user.id,
      ...data,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("createStudySessionAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create session",
    };
  }
}

export async function getStudySessionOptionsAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await getStudySessionOptions(session.user.id);
    return { success: true, data: result };
  } catch (error) {
    console.error("getStudySessionOptionsAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch options",
    };
  }
}

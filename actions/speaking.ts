"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getPronunciationExercise,
  submitPronunciation,
} from "@/services/speaking";

export async function fetchPronunciationExerciseAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await getPronunciationExercise({
      userId: session.user.id,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("fetchPronunciationExerciseAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch exercise",
    };
  }
}

export async function submitPronunciationAction(data: {
  exerciseId: string;
  recordingUrl: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await submitPronunciation({
      userId: session.user.id,
      exerciseId: data.exerciseId,
      recordingUrl: data.recordingUrl,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("submitPronunciationAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to submit pronunciation",
    };
  }
}

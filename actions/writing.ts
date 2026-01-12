"use server";

import { headers } from "next/headers";
import type { WritingType } from "@/app/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { getWritingPrompt, submitWriting } from "@/services/writing";

export async function fetchWritingPromptAction(data?: { type?: WritingType }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await getWritingPrompt({
      userId: session.user.id,
      type: data?.type,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("fetchWritingPromptAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch prompt",
    };
  }
}

export async function submitWritingAction(data: {
  promptId: string;
  content: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await submitWriting({
      userId: session.user.id,
      promptId: data.promptId,
      content: data.content,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("submitWritingAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to submit writing",
    };
  }
}

"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getSavedWords,
  isWordSaved,
  saveWord,
  unsaveWord,
} from "@/services/saved-vocabulary";

export async function saveWordAction(data: {
  wordId: string;
  context?: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await saveWord({
      userId: session.user.id,
      wordId: data.wordId,
      context: data.context,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("saveWordAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save word",
    };
  }
}

export async function unsaveWordAction(wordId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    await unsaveWord({
      userId: session.user.id,
      wordId,
    });

    return { success: true };
  } catch (error) {
    console.error("unsaveWordAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unsave word",
    };
  }
}

export async function getSavedWordsAction(data?: { page?: number }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await getSavedWords({
      userId: session.user.id,
      page: data?.page,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("getSavedWordsAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch saved words",
    };
  }
}

export async function isWordSavedAction(wordId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, data: false };
    }

    const isSaved = await isWordSaved(session.user.id, wordId);
    return { success: true, data: isSaved };
  } catch (error) {
    console.error("isWordSavedAction error:", error);
    return { success: false, data: false };
  }
}

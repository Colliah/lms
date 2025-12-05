"use server";

import { headers } from "next/headers";
import type {
  ProficiencyLevel,
  ReviewQuality,
} from "@/app/generated/prisma/enums";
import { auth } from "@/lib/auth";
import {
  browseWords,
  getCategories,
  getDailyVocabulary,
  getReviewSchedule,
  getVocabularyStats,
  submitReview,
} from "@/services/vocabulary";

export async function fetchDailyVocabularyAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await getDailyVocabulary({ userId: session.user.id });
    return { success: true, data: result };
  } catch (error) {
    console.error("fetchDailyVocabularyAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch vocabulary",
    };
  }
}

export async function submitVocabularyReviewAction(data: {
  wordId: string;
  quality: ReviewQuality;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await submitReview({
      userId: session.user.id,
      wordId: data.wordId,
      quality: data.quality,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("submitVocabularyReviewAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit review",
    };
  }
}

export async function getVocabularyStatsAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await getVocabularyStats({ userId: session.user.id });
    return { success: true, data: result };
  } catch (error) {
    console.error("getVocabularyStatsAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch statistics",
    };
  }
}

export async function browseWordsAction(data: {
  difficulty?: ProficiencyLevel;
  categoryId?: string;
  search?: string;
  page?: number;
}) {
  try {
    const result = await browseWords(data);
    return { success: true, data: result };
  } catch (error) {
    console.error("browseWordsAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to browse words",
    };
  }
}

export async function getCategoriesAction() {
  try {
    const result = await getCategories();
    return { success: true, data: result };
  } catch (error) {
    console.error("getCategoriesAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch categories",
    };
  }
}

export async function getReviewScheduleAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await getReviewSchedule(session.user.id);
    return { success: true, data: result };
  } catch (error) {
    console.error("getReviewScheduleAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch review schedule",
    };
  }
}

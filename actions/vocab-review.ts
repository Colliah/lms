"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import * as srsService from "@/services/vocab-srs";
import * as cardService from "@/services/vocab-card";

export async function getDueCardsAction(categoryId?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized", cards: [] };
  }

  try {
    const cards = await cardService.getDueCards({
      userId: session.user.id,
      categoryId,
    });

    return { success: true, cards };
  } catch {
    return { error: "Failed to fetch due cards", cards: [] };
  }
}

export async function submitReviewAction(cardId: string, quality: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Validate quality is between 0-5
  if (quality < 0 || quality > 5) {
    return { error: "Invalid quality rating" };
  }

  // Verify card ownership
  try {
    const card = await cardService.getCardById(cardId);
    if (card.category.userId !== session.user.id) {
      return { error: "Unauthorized" };
    }
  } catch {
    return { error: "Card not found" };
  }

  try {
    const result = await srsService.submitReview({
      cardId,
      quality,
    });

    return { success: true, result };
  } catch {
    return { error: "Failed to submit review" };
  }
}

export async function getReviewStatsAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const stats = await srsService.getReviewStats(session.user.id);
    return { success: true, stats };
  } catch {
    return { error: "Failed to fetch review stats" };
  }
}

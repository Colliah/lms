"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import * as z from "zod";
import * as cardService from "@/services/vocab-card";
import * as categoryService from "@/services/vocab-category";
import type { MasteryLevel } from "@/app/generated/prisma/enums";

const createCardSchema = z.object({
  word: z.string().min(1, "Word is required").max(200),
  meaning: z.string().min(1, "Meaning is required").max(1000),
  partOfSpeech: z.string().min(1, "Part of speech is required").max(50),
  exampleSentence: z.string().max(500).optional(),
  image: z.string().url().optional().or(z.literal("")),
  note: z.string().max(1000).optional(),
});

const updateCardSchema = z.object({
  word: z.string().min(1).max(200).optional(),
  meaning: z.string().min(1).max(1000).optional(),
  partOfSpeech: z.string().min(1).max(50).optional(),
  exampleSentence: z.string().max(500).optional(),
  image: z.string().url().optional().or(z.literal("")),
  note: z.string().max(1000).optional(),
});

export async function createCardAction(categoryId: string, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Verify category ownership
  try {
    await categoryService.getCategoryById({
      userId: session.user.id,
      categoryId,
    });
  } catch {
    return { error: "Category not found" };
  }

  const rawData = {
    word: formData.get("word") as string,
    meaning: formData.get("meaning") as string,
    partOfSpeech: formData.get("partOfSpeech") as string,
    exampleSentence: formData.get("exampleSentence") as string | undefined,
    image: formData.get("image") as string | undefined,
    note: formData.get("note") as string | undefined,
  };

  const validated = createCardSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  try {
    const card = await cardService.createCard({
      categoryId,
      ...validated.data,
      image: validated.data.image || undefined,
    });

    return { success: true, card };
  } catch {
    return { error: "Failed to create card" };
  }
}

export async function updateCardAction(cardId: string, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
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

  const rawData = {
    word: formData.get("word") as string | undefined,
    meaning: formData.get("meaning") as string | undefined,
    partOfSpeech: formData.get("partOfSpeech") as string | undefined,
    exampleSentence: formData.get("exampleSentence") as string | undefined,
    image: formData.get("image") as string | undefined,
    note: formData.get("note") as string | undefined,
  };

  const validated = updateCardSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  try {
    const card = await cardService.updateCard({
      cardId,
      ...validated.data,
      image: validated.data.image || undefined,
    });

    return { success: true, card };
  } catch {
    return { error: "Failed to update card" };
  }
}

export async function deleteCardAction(cardId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
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
    await cardService.deleteCard(cardId);
    return { success: true };
  } catch {
    return { error: "Failed to delete card" };
  }
}

export async function getCardsAction(
  categoryId: string,
  search?: string,
  masteryLevel?: MasteryLevel
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized", cards: [] };
  }

  // Verify category ownership
  try {
    await categoryService.getCategoryById({
      userId: session.user.id,
      categoryId,
    });
  } catch {
    return { error: "Category not found", cards: [] };
  }

  try {
    const cards = await cardService.getCards({
      categoryId,
      search,
      masteryLevel,
    });

    return { success: true, cards };
  } catch {
    return { error: "Failed to fetch cards", cards: [] };
  }
}

export async function getCardByIdAction(cardId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const card = await cardService.getCardById(cardId);
    if (card.category.userId !== session.user.id) {
      return { error: "Unauthorized" };
    }

    return { success: true, card };
  } catch {
    return { error: "Card not found" };
  }
}

export async function getCategoryCardStatsAction(categoryId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Verify category ownership
  try {
    await categoryService.getCategoryById({
      userId: session.user.id,
      categoryId,
    });
  } catch {
    return { error: "Category not found" };
  }

  try {
    const stats = await cardService.getCategoryCardStats(categoryId);
    return { success: true, stats };
  } catch {
    return { error: "Failed to fetch stats" };
  }
}

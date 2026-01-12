import { MasteryLevel } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

interface CreateCardParams {
  categoryId: string;
  word: string;
  meaning: string;
  partOfSpeech: string;
  exampleSentence?: string;
  image?: string;
  note?: string;
}

interface GetCardsParams {
  categoryId: string;
  search?: string;
  masteryLevel?: MasteryLevel;
}

interface UpdateCardParams {
  cardId: string;
  word?: string;
  meaning?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  image?: string;
  note?: string;
}

interface GetDueCardsParams {
  userId: string;
  categoryId?: string;
  limit?: number;
}

export async function createCard(params: CreateCardParams) {
  const {
    categoryId,
    word,
    meaning,
    partOfSpeech,
    exampleSentence,
    image,
    note,
  } = params;

  const card = await prisma.vocabCard.create({
    data: {
      categoryId,
      word,
      meaning,
      partOfSpeech,
      exampleSentence,
      image,
      note,
      masteryLevel: MasteryLevel.NEW,
      nextReviewDate: new Date(),
    },
  });

  return card;
}

export async function getCards(params: GetCardsParams) {
  const { categoryId, search, masteryLevel } = params;

  const where: {
    categoryId: string;
    masteryLevel?: MasteryLevel;
    OR?: Array<{
      word?: { contains: string; mode: "insensitive" };
      meaning?: { contains: string; mode: "insensitive" };
    }>;
  } = { categoryId };

  if (masteryLevel) {
    where.masteryLevel = masteryLevel;
  }

  if (search) {
    where.OR = [
      { word: { contains: search, mode: "insensitive" } },
      { meaning: { contains: search, mode: "insensitive" } },
    ];
  }

  const cards = await prisma.vocabCard.findMany({
    where,
    orderBy: [{ masteryLevel: "asc" }, { updatedAt: "desc" }],
  });

  return cards;
}

export async function getCardById(cardId: string) {
  const card = await prisma.vocabCard.findUnique({
    where: { id: cardId },
    include: {
      category: {
        select: { id: true, name: true, userId: true },
      },
    },
  });

  if (!card) {
    throw new Error("Card not found");
  }

  return card;
}

export async function updateCard(params: UpdateCardParams) {
  const { cardId, ...data } = params;

  const existing = await prisma.vocabCard.findUnique({
    where: { id: cardId },
  });

  if (!existing) {
    throw new Error("Card not found");
  }

  const updated = await prisma.vocabCard.update({
    where: { id: cardId },
    data: {
      ...(data.word !== undefined && { word: data.word }),
      ...(data.meaning !== undefined && { meaning: data.meaning }),
      ...(data.partOfSpeech !== undefined && {
        partOfSpeech: data.partOfSpeech,
      }),
      ...(data.exampleSentence !== undefined && {
        exampleSentence: data.exampleSentence,
      }),
      ...(data.image !== undefined && { image: data.image }),
      ...(data.note !== undefined && { note: data.note }),
    },
  });

  return updated;
}

export async function deleteCard(cardId: string) {
  const existing = await prisma.vocabCard.findUnique({
    where: { id: cardId },
  });

  if (!existing) {
    throw new Error("Card not found");
  }

  await prisma.vocabCard.delete({
    where: { id: cardId },
  });

  return { success: true };
}

export async function getDueCards(params: GetDueCardsParams) {
  const { userId, categoryId, limit = 20 } = params;

  const where: {
    category: { userId: string };
    nextReviewDate: { lte: Date };
    categoryId?: string;
  } = {
    category: { userId },
    nextReviewDate: { lte: new Date() },
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  const cards = await prisma.vocabCard.findMany({
    where,
    include: {
      category: {
        select: { id: true, name: true },
      },
    },
    orderBy: { nextReviewDate: "asc" },
    take: limit,
  });

  return cards;
}

export async function getAllCards(params: {
  categoryId: string;
  limit?: number;
}) {
  const { categoryId, limit = 50 } = params;

  const cards = await prisma.vocabCard.findMany({
    where: { categoryId },
    include: {
      category: {
        select: { id: true, name: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  return cards;
}

export async function getCategoryCardStats(categoryId: string) {
  const cards = await prisma.vocabCard.findMany({
    where: { categoryId },
    select: {
      masteryLevel: true,
      nextReviewDate: true,
    },
  });

  const now = new Date();
  const stats = {
    total: cards.length,
    dueForReview: cards.filter((c) => c.nextReviewDate <= now).length,
    byMastery: {
      NEW: 0,
      LEARNING: 0,
      REVIEW: 0,
      MASTERED: 0,
    },
  };

  for (const card of cards) {
    stats.byMastery[card.masteryLevel]++;
  }

  return stats;
}

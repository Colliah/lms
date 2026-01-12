import { prisma } from "@/lib/prisma";

interface SaveWordParams {
  userId: string;
  wordId: string;
  context?: string;
}

export async function saveWord(params: SaveWordParams) {
  const { userId, wordId, context } = params;

  try {
    const saved = await prisma.savedVocabulary.upsert({
      where: {
        userId_wordId: { userId, wordId },
      },
      create: {
        userId,
        wordId,
        context,
      },
      update: {
        context,
        savedAt: new Date(),
      },
      include: {
        word: {
          select: {
            id: true,
            word: true,
            translation: true,
          },
        },
      },
    });

    return saved;
  } catch (error) {
    console.error("saveWord error:", error);
    throw new Error("Failed to save word");
  }
}

interface UnsaveWordParams {
  userId: string;
  wordId: string;
}

export async function unsaveWord(params: UnsaveWordParams) {
  const { userId, wordId } = params;

  try {
    await prisma.savedVocabulary.delete({
      where: {
        userId_wordId: { userId, wordId },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("unsaveWord error:", error);
    throw new Error("Failed to unsave word");
  }
}

interface GetSavedWordsParams {
  userId: string;
  page?: number;
  limit?: number;
}

export async function getSavedWords(params: GetSavedWordsParams) {
  const { userId, page = 1, limit = 20 } = params;

  try {
    const [savedWords, total] = await Promise.all([
      prisma.savedVocabulary.findMany({
        where: { userId },
        include: {
          word: {
            include: {
              examples: { take: 1 },
            },
          },
        },
        orderBy: { savedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.savedVocabulary.count({
        where: { userId },
      }),
    ]);

    return {
      words: savedWords,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("getSavedWords error:", error);
    throw new Error("Failed to fetch saved words");
  }
}

export async function isWordSaved(userId: string, wordId: string) {
  try {
    const saved = await prisma.savedVocabulary.findUnique({
      where: {
        userId_wordId: { userId, wordId },
      },
    });

    return !!saved;
  } catch (error) {
    console.error("isWordSaved error:", error);
    return false;
  }
}

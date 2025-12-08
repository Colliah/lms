import { prisma } from "@/lib/prisma";

interface CreateCategoryParams {
  userId: string;
  name: string;
  description?: string;
  color?: string;
}

interface GetCategoriesParams {
  userId: string;
  search?: string;
}

interface UpdateCategoryParams {
  userId: string;
  categoryId: string;
  name?: string;
  description?: string;
  color?: string;
}

interface DeleteCategoryParams {
  userId: string;
  categoryId: string;
}

export async function createCategory(params: CreateCategoryParams) {
  const { userId, name, description, color } = params;

  const category = await prisma.vocabCategory.create({
    data: {
      userId,
      name,
      description,
      color,
    },
    include: {
      _count: { select: { cards: true } },
    },
  });

  return category;
}

export async function getCategories(params: GetCategoriesParams) {
  const { userId, search } = params;

  const where: {
    userId: string;
    name?: { contains: string; mode: "insensitive" };
  } = { userId };

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const categories = await prisma.vocabCategory.findMany({
    where,
    include: {
      _count: { select: { cards: true } },
      cards: {
        select: {
          masteryLevel: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return categories.map((category) => {
    const masteryStats = {
      NEW: 0,
      LEARNING: 0,
      REVIEW: 0,
      MASTERED: 0,
    };

    for (const card of category.cards) {
      masteryStats[card.masteryLevel]++;
    }

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      cardCount: category._count.cards,
      masteryStats,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  });
}

export async function getCategoryById(params: {
  userId: string;
  categoryId: string;
}) {
  const { userId, categoryId } = params;

  const category = await prisma.vocabCategory.findFirst({
    where: {
      id: categoryId,
      userId,
    },
    include: {
      _count: { select: { cards: true } },
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
}

export async function updateCategory(params: UpdateCategoryParams) {
  const { userId, categoryId, name, description, color } = params;

  // Verify ownership
  const existing = await prisma.vocabCategory.findFirst({
    where: { id: categoryId, userId },
  });

  if (!existing) {
    throw new Error("Category not found");
  }

  const updated = await prisma.vocabCategory.update({
    where: { id: categoryId },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(color !== undefined && { color }),
    },
  });

  return updated;
}

export async function deleteCategory(params: DeleteCategoryParams) {
  const { userId, categoryId } = params;

  // Verify ownership
  const existing = await prisma.vocabCategory.findFirst({
    where: { id: categoryId, userId },
  });

  if (!existing) {
    throw new Error("Category not found");
  }

  await prisma.vocabCategory.delete({
    where: { id: categoryId },
  });

  return { success: true };
}

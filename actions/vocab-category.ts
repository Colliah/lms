"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import * as z from "zod";
import * as categoryService from "@/services/vocab-category";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  color: z.string().max(20).optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  color: z.string().max(20).optional(),
});

export async function createCategoryAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string | undefined,
    color: formData.get("color") as string | undefined,
  };

  const validated = createCategorySchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  try {
    const category = await categoryService.createCategory({
      userId: session.user.id,
      ...validated.data,
    });

    return { success: true, category };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "A category with this name already exists" };
    }
    return { error: "Failed to create category" };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  formData: FormData
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const rawData = {
    name: formData.get("name") as string | undefined,
    description: formData.get("description") as string | undefined,
    color: formData.get("color") as string | undefined,
  };

  const validated = updateCategorySchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  try {
    const category = await categoryService.updateCategory({
      userId: session.user.id,
      categoryId,
      ...validated.data,
    });

    return { success: true, category };
  } catch (error) {
    if (error instanceof Error && error.message === "Category not found") {
      return { error: "Category not found" };
    }
    return { error: "Failed to update category" };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await categoryService.deleteCategory({
      userId: session.user.id,
      categoryId,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "Category not found") {
      return { error: "Category not found" };
    }
    return { error: "Failed to delete category" };
  }
}

export async function getCategoriesAction(search?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized", categories: [] };
  }

  try {
    const categories = await categoryService.getCategories({
      userId: session.user.id,
      search,
    });

    return { success: true, categories };
  } catch {
    return { error: "Failed to fetch categories", categories: [] };
  }
}

export async function getCategoryByIdAction(categoryId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const category = await categoryService.getCategoryById({
      userId: session.user.id,
      categoryId,
    });

    return { success: true, category };
  } catch {
    return { error: "Category not found" };
  }
}

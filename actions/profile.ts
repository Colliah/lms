"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateUserProfileAction(data: {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Update user's display name and avatar in User table
    if (data.displayName !== undefined || data.avatarUrl !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: data.displayName,
          image: data.avatarUrl,
        },
      });
    }

    // Update bio in UserProfile (create if doesn't exist)
    if (data.bio !== undefined) {
      await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          interests: [data.bio], // Store bio in interests for now
        },
        update: {
          interests: [data.bio],
        },
      });
    }

    return { success: true, data: { updated: true } };
  } catch (error) {
    console.error("updateUserProfileAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

export async function getUserAchievementsAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const achievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      include: {
        achievement: true,
      },
      orderBy: {
        earnedAt: "desc",
      },
    });

    return { success: true, data: achievements };
  } catch (error) {
    console.error("getUserAchievementsAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch achievements",
    };
  }
}

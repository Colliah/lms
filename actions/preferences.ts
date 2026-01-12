"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getUserPreferencesAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    return {
      success: true,
      data: {
        preferences: preferences || null,
        profile: profile || null,
      },
    };
  } catch (error) {
    console.error("getUserPreferencesAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch preferences",
    };
  }
}

export async function updateUserPreferencesAction(data: {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  dailyReminder?: boolean;
  reminderTime?: string;
  soundEffects?: boolean;
  autoPlayAudio?: boolean;
  showTranslations?: boolean;
  interfaceLanguage?: string;
  translationLanguage?: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const preferences = await prisma.userPreferences.update({
      where: { userId: session.user.id },
      data,
    });

    return { success: true, data: preferences };
  } catch (error) {
    console.error("updateUserPreferencesAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update preferences",
    };
  }
}

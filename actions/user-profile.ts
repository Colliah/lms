"use server";

import { headers } from "next/headers";
import type {
  LearningGoal,
  LearningStyle,
  ProficiencyLevel,
} from "@/app/generated/prisma/enums";
import { auth } from "@/lib/auth";
import {
  assessUserLevel,
  createUserProfile,
  getUserProfile,
  updatePreferences,
} from "@/services/user-profile";

export async function saveOnboardingAction(data: {
  currentLevel: ProficiencyLevel;
  goals: LearningGoal[];
  interests: string[];
  dailyCommitment: number;
  learningStyle: LearningStyle;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await createUserProfile({
      userId: session.user.id,
      ...data,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("saveOnboardingAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save onboarding data",
    };
  }
}

export async function updatePreferencesAction(data: {
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

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await updatePreferences({
      userId: session.user.id,
      ...data,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("updatePreferencesAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update preferences",
    };
  }
}

export async function getUserProfileAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await getUserProfile(session.user.id);
    return { success: true, data: result };
  } catch (error) {
    console.error("getUserProfileAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch profile",
    };
  }
}

export async function assessLevelAction(score: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await assessUserLevel({
      userId: session.user.id,
      score,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("assessLevelAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assess level",
    };
  }
}

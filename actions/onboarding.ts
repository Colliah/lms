"use server";

import { headers } from "next/headers";
import type {
  LearningGoal,
  LearningStyle,
  ProficiencyLevel,
} from "@/app/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface CompleteOnboardingParams {
  currentLevel: ProficiencyLevel;
  assessmentScore: number;
  goals: LearningGoal[];
  dailyCommitment: number;
  learningStyle: LearningStyle;
  interests: string[];
}

export async function completeOnboardingAction(data: CompleteOnboardingParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Create or update user profile
    await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        currentLevel: data.currentLevel,
        goals: data.goals,
        interests: data.interests,
        dailyCommitment: data.dailyCommitment,
        learningStyle: data.learningStyle,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
      update: {
        currentLevel: data.currentLevel,
        goals: data.goals,
        interests: data.interests,
        dailyCommitment: data.dailyCommitment,
        learningStyle: data.learningStyle,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
    });

    // Initialize user streak
    await prisma.userStreak.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        currentStreak: 0,
        longestStreak: 0,
        freezesAvailable: 2, // Give 2 free streak freezes to new users
      },
      update: {},
    });

    return { success: true, data: { profileUpdated: true } };
  } catch (error) {
    console.error("completeOnboardingAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to complete onboarding",
    };
  }
}

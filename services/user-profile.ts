import {
  type LearningGoal,
  type LearningStyle,
  ProficiencyLevel,
} from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

interface CreateUserProfileParams {
  userId: string;
  currentLevel?: ProficiencyLevel;
  goals?: LearningGoal[];
  interests?: string[];
  dailyCommitment?: number;
  learningStyle?: LearningStyle;
}

export async function createUserProfile(params: CreateUserProfileParams) {
  const { userId, ...profileData } = params;

  try {
    return await prisma.userProfile.create({
      data: {
        userId,
        ...profileData,
        onboardingDone: true,
      },
    });
  } catch (error) {
    console.error("createUserProfile error:", error);
    throw new Error("Failed to create user profile");
  }
}

interface UpdatePreferencesParams {
  userId: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  dailyReminder?: boolean;
  reminderTime?: string;
  soundEffects?: boolean;
  autoPlayAudio?: boolean;
  showTranslations?: boolean;
  interfaceLanguage?: string;
  translationLanguage?: string;
}

export async function updatePreferences(params: UpdatePreferencesParams) {
  const { userId, ...preferences } = params;

  try {
    return await prisma.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...preferences,
      },
      update: {
        ...preferences,
      },
    });
  } catch (error) {
    console.error("updatePreferences error:", error);
    throw new Error("Failed to update preferences");
  }
}

interface AssessUserLevelParams {
  userId: string;
  score: number; // 0-100
}

export async function assessUserLevel(params: AssessUserLevelParams) {
  const { userId, score } = params;

  let level: ProficiencyLevel = ProficiencyLevel.A1;
  if (score >= 90) level = ProficiencyLevel.C2;
  else if (score >= 80) level = ProficiencyLevel.C1;
  else if (score >= 65) level = ProficiencyLevel.B2;
  else if (score >= 50) level = ProficiencyLevel.B1;
  else if (score >= 30) level = ProficiencyLevel.A2;

  try {
    return await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        currentLevel: level,
        assessmentScore: score,
        onboardingDone: true,
      },
      update: {
        currentLevel: level,
        assessmentScore: score,
      },
    });
  } catch (error) {
    console.error("assessUserLevel error:", error);
    throw new Error("Failed to assess user level");
  }
}

export async function getUserProfile(userId: string) {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    return { profile, preferences };
  } catch (error) {
    console.error("getUserProfile error:", error);
    throw new Error("Failed to fetch user profile");
  }
}

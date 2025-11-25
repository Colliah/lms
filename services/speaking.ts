import { ProficiencyLevel } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

interface GetPronunciationParams {
  userId: string;
}

export async function getPronunciationExercise(params: GetPronunciationParams) {
  const { userId } = params;

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { currentLevel: true },
    });
    const level = profile?.currentLevel || ProficiencyLevel.A1;

    const exercise = await prisma.pronunciationExercise.findFirst({
      where: { difficulty: level },
      select: {
        id: true,
        content: true,
        phonetic: true,
        audioUrl: true,
        tips: true,
      },
    });

    if (!exercise) {
      return null;
    }

    // Map 'content' to 'targetPhrase' to match component interface
    return {
      id: exercise.id,
      targetPhrase: exercise.content,
      phonetic: exercise.phonetic,
      audioUrl: exercise.audioUrl,
      tips: exercise.tips,
    };
  } catch (error) {
    console.error("getPronunciationExercise error:", error);
    throw new Error("Failed to fetch pronunciation exercise");
  }
}

interface SubmitPronunciationParams {
  userId: string;
  exerciseId: string;
  recordingUrl: string;
}

export async function submitPronunciation(params: SubmitPronunciationParams) {
  const { userId, exerciseId, recordingUrl } = params;

  try {
    // Placeholder scoring logic
    const score = Math.floor(Math.random() * 30) + 70; // Random score 70-100

    const submission = await prisma.userPronunciation.create({
      data: {
        userId,
        exerciseId,
        recordingUrl,
        score,
        feedback: "Good pronunciation! Watch your intonation.",
      },
    });

    // Update daily activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyActivity.upsert({
      where: {
        userId_date: { userId, date: today },
      },
      create: {
        userId,
        date: today,
        speakingCount: 1,
      },
      update: {
        speakingCount: { increment: 1 },
      },
    });

    return submission;
  } catch (error) {
    console.error("submitPronunciation error:", error);
    throw new Error("Failed to submit pronunciation");
  }
}

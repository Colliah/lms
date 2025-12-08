import type { MasteryLevel } from "@/app/generated/prisma/enums";

export interface VocabCard {
  id: string;
  word: string;
  meaning: string;
  partOfSpeech: string;
  exampleSentence: string | null;
  image: string | null;
  note: string | null;
  masteryLevel: MasteryLevel;
  easeFactor: number;
  intervalDays: number;
  repetitionCount: number;
  nextReviewDate: Date;
  lastReviewedAt: Date | null;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VocabCategory {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VocabReviewLog {
  id: string;
  cardId: string;
  quality: number;
  reviewedAt: Date;
}

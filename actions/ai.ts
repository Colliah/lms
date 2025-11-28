"use server";

import { GeminiService } from "@/lib/gemini";

export async function getWordFamilyAction(word: string) {
  try {
    const wordFamily = await GeminiService.getWordFamily(word);
    return { success: true, data: wordFamily };
  } catch (error) {
    console.error("getWordFamilyAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get word family",
    };
  }
}

export async function getCollocationsAction(word: string) {
  try {
    const collocations = await GeminiService.getCollocations(word);
    return { success: true, data: collocations };
  } catch (error) {
    console.error("getCollocationsAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get collocations",
    };
  }
}

export async function getPhrasalVerbsAction(word: string) {
  try {
    const phrasalVerbs = await GeminiService.getPhrasalVerbs(word);
    return { success: true, data: phrasalVerbs };
  } catch (error) {
    console.error("getPhrasalVerbsAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get phrasal verbs",
    };
  }
}

export async function getIdiomsAction(word: string) {
  try {
    const idioms = await GeminiService.getIdioms(word);
    return { success: true, data: idioms };
  } catch (error) {
    console.error("getIdiomsAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get idioms",
    };
  }
}

export async function evaluatePronunciationAction(
  targetWord: string,
  spokenText: string,
) {
  try {
    const feedback = await GeminiService.evaluatePronunciation(
      targetWord,
      spokenText,
    );
    return { success: true, data: feedback };
  } catch (error) {
    console.error("evaluatePronunciationAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to evaluate pronunciation",
    };
  }
}

export async function getWordOfTheDayAction() {
  try {
    const wordOfDay = await GeminiService.getWordOfTheDay();
    return { success: true, data: wordOfDay };
  } catch (error) {
    console.error("getWordOfTheDayAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get word of the day",
    };
  }
}

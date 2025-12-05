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

// =============================================================================
// Merriam-Webster API Actions
// =============================================================================

import {
  type DictionaryEntry,
  MerriamWebsterService,
  type ThesaurusEntry,
} from "@/lib/merriam-webster";

export async function getDictionaryDefinitionAction(word: string): Promise<{
  success: boolean;
  data?: DictionaryEntry | null;
  error?: string;
}> {
  try {
    const definition =
      await MerriamWebsterService.getDictionaryDefinition(word);
    return { success: true, data: definition };
  } catch (error) {
    console.error("getDictionaryDefinitionAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get dictionary definition",
    };
  }
}

export async function getThesaurusDataAction(word: string): Promise<{
  success: boolean;
  data?: ThesaurusEntry | null;
  error?: string;
}> {
  try {
    const thesaurus = await MerriamWebsterService.getThesaurusEntry(word);
    return { success: true, data: thesaurus };
  } catch (error) {
    console.error("getThesaurusDataAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get thesaurus data",
    };
  }
}

export async function getMWAudioUrlAction(word: string): Promise<{
  success: boolean;
  data?: string | null;
  error?: string;
}> {
  try {
    const audioUrl = await MerriamWebsterService.getAudioUrl(word);
    return { success: true, data: audioUrl };
  } catch (error) {
    console.error("getMWAudioUrlAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get audio URL",
    };
  }
}

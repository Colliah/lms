/**
 * Merriam-Webster Dictionary & Thesaurus API Service
 *
 * Provides integration with Merriam-Webster's Collegiate Dictionary
 * and Thesaurus APIs for authoritative word definitions, pronunciations,
 * synonyms, and antonyms.
 */

import { DictionaryEntry, ThesaurusEntry } from "@/types/dictionary";
import { formatMWPhonetic } from ".";

// =============================================================================
// Types for Dictionary API Response
// =============================================================================

interface MWPronunciation {
  mw?: string;
  l?: string;
  sound?: {
    audio: string;
    ref?: string;
    stat?: string;
  };
}

interface MWHeadwordInfo {
  hw: string;
  prs?: MWPronunciation[];
}

interface MWSense {
  dt: Array<[string, string | unknown]>;
  sdsense?: {
    sd: string;
    dt: Array<[string, string]>;
  };
}

interface MWDefinition {
  vd?: string;
  sseq: Array<Array<Array<string | MWSense>>>;
}

interface MWDictionaryEntry {
  meta: {
    id: string;
    uuid: string;
    stems: string[];
    offensive: boolean;
  };
  hom?: number;
  hwi: MWHeadwordInfo;
  fl?: string;
  def?: MWDefinition[];
  shortdef?: string[];
  et?: Array<[string, string]>;
  date?: string;
}

// =============================================================================
// Types for Thesaurus API Response
// =============================================================================

interface MWThesaurusSense {
  dt: Array<[string, string]>;
  syn_list?: Array<Array<{ wd: string }>>;
  ant_list?: Array<Array<{ wd: string }>>;
  sim_list?: Array<Array<{ wd: string }>>;
  opp_list?: Array<Array<{ wd: string }>>;
  rel_list?: Array<Array<{ wd: string }>>;
  near_list?: Array<Array<{ wd: string }>>;
}

interface MWThesaurusEntry {
  meta: {
    id: string;
    uuid: string;
    stems: string[];
  };
  hwi: MWHeadwordInfo;
  fl?: string;
  def?: Array<{
    sseq: Array<Array<Array<string | MWThesaurusSense>>>;
  }>;
  shortdef?: string[];
}

// =============================================================================
// Parsed Output Types
// =============================================================================

// =============================================================================
// API Configuration
// =============================================================================

const DICTIONARY_BASE_URL =
  "https://dictionaryapi.com/api/v3/references/collegiate/json";
const THESAURUS_BASE_URL =
  "https://dictionaryapi.com/api/v3/references/thesaurus/json";
const AUDIO_BASE_URL =
  "https://media.merriam-webster.com/audio/prons/en/us/mp3";

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Build the audio URL for a Merriam-Webster pronunciation
 * @param audio - The audio filename from the API response
 * @returns Full URL to the audio file
 */
function buildAudioUrl(audio: string): string {
  let subdirectory: string;

  if (audio.startsWith("bix")) {
    subdirectory = "bix";
  } else if (audio.startsWith("gg")) {
    subdirectory = "gg";
  } else if (/^[0-9_]/.test(audio)) {
    subdirectory = "number";
  } else {
    subdirectory = audio.charAt(0);
  }

  return `${AUDIO_BASE_URL}/${subdirectory}/${audio}.mp3`;
}

/**
 * Clean text by removing markup tokens like {bc}, {it}, {/it}, etc.
 */
function cleanText(text: string): string {
  return text
    .replace(/\{bc\}/g, "") // Remove "bold colon" marker
    .replace(/\{it\}/g, "") // Remove italic start
    .replace(/\{\/it\}/g, "") // Remove italic end
    .replace(/\{ldquo\}/g, '"') // Opening quote
    .replace(/\{rdquo\}/g, '"') // Closing quote
    .replace(/\{sc\}/g, "") // Small caps start
    .replace(/\{\/sc\}/g, "") // Small caps end
    .replace(/\{inf\}/g, "") // Subscript start
    .replace(/\{\/inf\}/g, "") // Subscript end
    .replace(/\{sup\}/g, "") // Superscript start
    .replace(/\{\/sup\}/g, "") // Superscript end
    .replace(/\{b\}/g, "") // Bold start
    .replace(/\{\/b\}/g, "") // Bold end
    .replace(/\{a_link\|([^}]+)\}/g, "$1") // Anchor link
    .replace(/\{d_link\|([^|]+)\|[^}]*\}/g, "$1") // Definition link
    .replace(/\{sx\|([^|]+)\|[^}]*\}/g, "$1") // Cross-reference
    .replace(/\{wi\}/g, "") // Word info start
    .replace(/\{\/wi\}/g, "") // Word info end
    .replace(/\{phrase\}/g, "") // Phrase start
    .replace(/\{\/phrase\}/g, "") // Phrase end
    .replace(/\{qword\}/g, "") // Quote word start
    .replace(/\{\/qword\}/g, "") // Quote word end
    .trim();
}

/**
 * Extract definitions from a sense sequence
 */
function extractDefinitions(def: MWDefinition[] | undefined): {
  definitions: string[];
  examples: string[];
} {
  const definitions: string[] = [];
  const examples: string[] = [];

  if (!def) return { definitions, examples };

  for (const defItem of def) {
    for (const sseq of defItem.sseq) {
      for (const sense of sseq) {
        if (Array.isArray(sense) && sense[0] === "sense") {
          const senseData = sense[1] as MWSense;
          if (senseData.dt) {
            for (const dt of senseData.dt) {
              if (dt[0] === "text" && typeof dt[1] === "string") {
                definitions.push(cleanText(dt[1]));
              }
              if (dt[0] === "vis" && Array.isArray(dt[1])) {
                for (const vis of dt[1] as Array<{ t: string }>) {
                  if (vis.t) {
                    examples.push(cleanText(vis.t));
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return { definitions, examples };
}

/**
 * Extract words from a thesaurus word list
 */
function extractWordList(
  list: Array<Array<{ wd: string }>> | undefined
): string[] {
  if (!list) return [];

  const words: string[] = [];
  for (const group of list) {
    for (const item of group) {
      if (item.wd) {
        words.push(item.wd);
      }
    }
  }
  return words;
}

// =============================================================================
// Main Service Functions
// =============================================================================

export const MerriamWebsterService = {
  /**
   * Look up a word in the Merriam-Webster Collegiate Dictionary
   * @param word - The word to look up
   * @returns Parsed dictionary entry or null if not found
   */
  async getDictionaryDefinition(word: string): Promise<DictionaryEntry | null> {
    const apiKey = process.env.MERRIAM_WEBSTER_DICTIONARY_API_KEY;
    if (!apiKey) {
      throw new Error("MERRIAM_WEBSTER_DICTIONARY_API_KEY is not configured");
    }

    const url = `${DICTIONARY_BASE_URL}/${encodeURIComponent(
      word
    )}?key=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Dictionary API error: ${response.status}`);
      }

      const data = await response.json();

      // If the response is an array of strings, these are suggestions (word not found)
      if (
        Array.isArray(data) &&
        data.length > 0 &&
        typeof data[0] === "string"
      ) {
        return null;
      }

      // If no results
      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }

      // Take the first entry
      const entry = data[0] as MWDictionaryEntry;

      // Extract pronunciations
      const pronunciations = extractPronunciations(entry.hwi);

      // Extract definitions and examples
      const { definitions, examples } = extractDefinitions(entry.def);

      // Extract etymology
      let etymology: string | null = null;
      if (entry.et && entry.et.length > 0) {
        etymology = entry.et
          .map((et) => (typeof et[1] === "string" ? cleanText(et[1]) : ""))
          .filter(Boolean)
          .join(" ");
      }

      return {
        word: entry.hwi?.hw?.replace(/[\u00B7*]/g, "") || word,
        pronunciations,
        partOfSpeech: entry.fl || null,
        definitions,
        shortDefinitions: entry.shortdef || [],
        examples,
        etymology,
        firstKnownUse: entry.date || null,
      };
    } catch (error) {
      console.error("Merriam-Webster Dictionary API error:", error);
      throw error;
    }
  },

  /**
   * Look up a word in the Merriam-Webster Thesaurus
   * @param word - The word to look up
   * @returns Parsed thesaurus entry or null if not found
   */
  async getThesaurusEntry(word: string): Promise<ThesaurusEntry | null> {
    const apiKey = process.env.MERRIAM_WEBSTER_THESAURUS_API_KEY;
    if (!apiKey) {
      throw new Error("MERRIAM_WEBSTER_THESAURUS_API_KEY is not configured");
    }

    const url = `${THESAURUS_BASE_URL}/${encodeURIComponent(
      word
    )}?key=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Thesaurus API error: ${response.status}`);
      }

      const data = await response.json();

      // If the response is an array of strings, these are suggestions (word not found)
      if (
        Array.isArray(data) &&
        data.length > 0 &&
        typeof data[0] === "string"
      ) {
        return null;
      }

      // If no results
      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }

      // Take the first entry
      const entry = data[0] as MWThesaurusEntry;
      const pronunciations = extractPronunciations(entry.hwi);

      // Collect all synonyms, antonyms, etc. from all senses
      let synonyms: string[] = [];
      let antonyms: string[] = [];
      let relatedWords: string[] = [];
      let nearAntonyms: string[] = [];

      if (entry.def) {
        for (const defItem of entry.def) {
          for (const sseq of defItem.sseq) {
            for (const sense of sseq) {
              if (Array.isArray(sense) && sense[0] === "sense") {
                const senseData = sense[1] as MWThesaurusSense;
                synonyms = [
                  ...synonyms,
                  ...extractWordList(senseData.syn_list),
                ];
                antonyms = [
                  ...antonyms,
                  ...extractWordList(senseData.ant_list),
                ];
                relatedWords = [
                  ...relatedWords,
                  ...extractWordList(senseData.rel_list),
                  ...extractWordList(senseData.sim_list),
                ];
                nearAntonyms = [
                  ...nearAntonyms,
                  ...extractWordList(senseData.near_list),
                  ...extractWordList(senseData.opp_list),
                ];
              }
            }
          }
        }
      }

      // Remove duplicates
      synonyms = [...new Set(synonyms)];
      antonyms = [...new Set(antonyms)];
      relatedWords = [...new Set(relatedWords)];
      nearAntonyms = [...new Set(nearAntonyms)];

      return {
        word: entry.hwi?.hw?.replace(/[\u00B7*]/g, "") || word,
        partOfSpeech: entry.fl || null,
        definition: entry.shortdef?.[0] || null,
        synonyms,
        antonyms,
        relatedWords,
        nearAntonyms,
        pronunciations,
      };
    } catch (error) {
      console.error("Merriam-Webster Thesaurus API error:", error);
      throw error;
    }
  },

  /**
   * Get audio URL for a word pronunciation
   * @param word - The word to get audio for
   * @returns Audio URL or null if not available
   */
  async getAudioUrl(word: string): Promise<string | null> {
    try {
      const entry = await this.getDictionaryDefinition(word);
      if (entry && entry.pronunciations.length > 0) {
        return entry.pronunciations[0].audioUrl;
      }
      return null;
    } catch {
      return null;
    }
  },
};

function extractPronunciations(
  hwi: any
): { notation: string; audioUrl: string | null }[] {
  const results = [];
  if (hwi?.prs) {
    for (const prs of hwi.prs) {
      if (prs.mw) {
        const cleanNotation = formatMWPhonetic(prs.mw);
        results.push({
          notation: cleanNotation,
          audioUrl: prs.sound?.audio ? buildAudioUrl(prs.sound.audio) : null,
        });
      }
    }
  }
  return results;
}

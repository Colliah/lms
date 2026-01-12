export interface DictionaryEntry {
  word: string;
  pronunciations: Array<{
    notation: string;
    audioUrl: string | null;
  }>;
  partOfSpeech: string | null;
  definitions: string[];
  shortDefinitions: string[];
  examples: string[];
  etymology: string | null;
  firstKnownUse: string | null;
}

export interface ThesaurusEntry {
  word: string;
  partOfSpeech: string | null;
  definition: string | null;
  synonyms: string[];
  antonyms: string[];
  relatedWords: string[];
  nearAntonyms: string[];
  pronunciations: { notation: string; audioUrl: string | null }[];
}

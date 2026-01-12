export interface WordData {
  word: string;
  ipa: string;
  type: string;
  band: string;
  definition: string;
  vietnameseDefinition: string;
  example: {
    sentence: string;
    translation: string;
  }[];
  synonym: string[];
  antonym: string[];
  image_prompt: string;
  image?: string | null;
}

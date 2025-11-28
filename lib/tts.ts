/**
 * Native Browser Text-to-Speech Service
 * No API costs, works offline
 */

export interface TTSOptions {
  rate?: number; // Speed: 0.1 to 10 (default: 1)
  pitch?: number; // Pitch: 0 to 2 (default: 1)
  voice?: string; // Voice name
  lang?: string; // Language code
}

export const TTSService = {
  /**
   * Speak text using browser's native TTS
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (typeof window === "undefined" || !window.speechSynthesis) {
          reject(new Error("TTS not supported"));
          return;
        }

        // Cancel any existing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang || "en-US";
        utterance.rate = options.rate || 0.9; // Slightly slower for clarity
        utterance.pitch = options.pitch || 1;

        // Try to select a high-quality voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) =>
            (v.name.includes("Google") && v.lang === "en-US") ||
            (v.name.includes("Samantha") && v.lang === "en-US") ||
            (options.voice && v.name === options.voice) ||
            v.lang === "en-US",
        );

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = (e) => reject(e);

        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("TTS Error:", error);
        reject(error);
      }
    });
  },

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return [];
    }
    return window.speechSynthesis.getVoices();
  },

  /**
   * Stop current speech
   */
  stop(): void {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  },
};

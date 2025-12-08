"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

interface TTSOptions {
  text: string;
  voiceId?: string;
}

export async function generateSpeechAction(options: TTSOptions) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    console.error("ELEVENLABS_API_KEY is not set in environment variables");
    return {
      error: "TTS service not configured. Please set ELEVENLABS_API_KEY.",
    };
  }

  const { text, voiceId = DEFAULT_VOICE_ID } = options;

  if (!text) {
    return { error: "Text is required" };
  }

  if (text.length > 500) {
    return { error: "Text is too long (max 500 characters)" };
  }

  try {
    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("ElevenLabs API error:", response.status, errorData);

      if (response.status === 401) {
        return { error: "Invalid API key" };
      }
      if (response.status === 429) {
        return { error: "Rate limit exceeded. Please try again later." };
      }
      if (response.status === 400) {
        return { error: errorData.detail?.message || "Invalid request" };
      }

      return { error: `TTS failed: ${response.status}` };
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    return {
      success: true,
      audio: `data:audio/mpeg;base64,${base64Audio}`,
    };
  } catch (error) {
    console.error("TTS error:", error);
    return { error: "Network error. Please check your connection." };
  }
}

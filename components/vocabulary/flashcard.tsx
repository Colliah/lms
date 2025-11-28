"use client";

import { Volume2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { WordEnhancements } from "@/components/ai/word-enhancements";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TTSService } from "@/lib/tts";

interface FlashcardProps {
  word: {
    word: string;
    translation: string;
    phonetic: string | null;
    definition: string;
    audios: Array<{ url: string }>;
    examples: Array<{
      sentence: string;
      translation: string;
      highlight: string;
    }>;
  };
  isFlipped: boolean;
  onFlip: () => void;
}

export default function Flashcard({ word, isFlipped, onFlip }: FlashcardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showEnhancements, setShowEnhancements] = useState(false);

  async function playAudio() {
    if (isPlaying) return;

    setIsPlaying(true);
    try {
      // Try audio file first if available
      if (word.audios.length > 0) {
        const audio = new Audio(word.audios[0].url);
        await audio.play();
        audio.onended = () => setIsPlaying(false);
      } else {
        // Fallback to TTS
        await TTSService.speak(word.word);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      toast.error("Failed to play audio");
      setIsPlaying(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card
        className="cursor-pointer transition-all hover:shadow-lg min-h-[400px]"
        onClick={onFlip}
      >
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
          {!isFlipped ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <h2 className="text-5xl font-bold">{word.word}</h2>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio();
                  }}
                  disabled={isPlaying}
                  title="Play pronunciation"
                >
                  <Volume2
                    className={`h-6 w-6 ${isPlaying ? "animate-pulse" : ""}`}
                  />
                </Button>
              </div>
              {word.phonetic && (
                <p className="text-lg text-muted-foreground">{word.phonetic}</p>
              )}
              <p className="text-muted-foreground text-sm mt-8">
                Click to reveal translation
              </p>
            </div>
          ) : (
            <div className="w-full space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-bold">{word.translation}</h2>
                <p className="text-lg text-muted-foreground">
                  {word.definition}
                </p>
              </div>

              {word.examples.length > 0 && (
                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    Examples:
                  </h3>
                  {word.examples.slice(0, 2).map((example) => (
                    <div key={example.sentence} className="space-y-1">
                      <p className="text-base">"{example.sentence}"</p>
                      <p className="text-sm text-muted-foreground italic">
                        {example.translation}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEnhancements(!showEnhancements);
                  }}
                >
                  {showEnhancements ? "Hide" : "Show"} AI Enhancements
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Enhancements - shown when card is flipped */}
      {isFlipped && showEnhancements && <WordEnhancements word={word.word} />}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateSpeechAction } from "@/actions/tts";
import { toast } from "sonner";

interface AudioButtonProps {
  text: string;
  className?: string;
}

export function AudioButton({ text, className }: AudioButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  async function handlePlay() {
    // If audio is already playing, stop it
    if (audio && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    setIsLoading(true);

    try {
      const result = await generateSpeechAction({ text });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.audio) {
        const newAudio = new Audio(result.audio);
        setAudio(newAudio);

        newAudio.onended = () => {
          setAudio(null);
        };

        await newAudio.play();
      }
    } catch {
      toast.error("Failed to play audio");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        handlePlay();
      }}
      disabled={isLoading}
      title="Play pronunciation"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  );
}

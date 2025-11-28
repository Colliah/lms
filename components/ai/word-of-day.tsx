"use client";

import { Sparkles, TrendingUp, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getWordOfTheDayAction } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TTSService } from "@/lib/tts";

export function WordOfTheDay() {
  const [wordData, setWordData] = useState<{
    word: string;
    type: string;
    definition: string;
    vietnameseDefinition: string;
    example: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function loadWordOfDay() {
      const result = await getWordOfTheDayAction();
      if (result.success && result.data) {
        setWordData(result.data);
      }
      setIsLoading(false);
    }
    loadWordOfDay();
  }, []);

  async function speakWord() {
    if (!wordData || isPlaying) return;

    setIsPlaying(true);
    try {
      await TTSService.speak(wordData.word);
    } finally {
      setIsPlaying(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <CardTitle>Word of the Day</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!wordData) {
    return null;
  }

  return (
    <Card className="border-yellow-200 dark:border-yellow-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <CardTitle>Word of the Day</CardTitle>
          </div>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold">{wordData.word}</h3>
            <p className="text-sm text-muted-foreground italic">
              {wordData.type}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={speakWord}
            disabled={isPlaying}
          >
            <Volume2
              className={`h-5 w-5 ${isPlaying ? "animate-pulse" : ""}`}
            />
          </Button>
        </div>

        <div className="space-y-2">
          <div>
            <CardDescription className="font-semibold">
              Definition:
            </CardDescription>
            <p className="text-sm">{wordData.definition}</p>
          </div>

          <div>
            <CardDescription className="font-semibold">
              Vietnamese:
            </CardDescription>
            <p className="text-sm">{wordData.vietnameseDefinition}</p>
          </div>

          <div>
            <CardDescription className="font-semibold">
              Example:
            </CardDescription>
            <p className="text-sm italic">"{wordData.example}"</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getWordOfTheDayAction } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TTSService } from "@/lib/tts";
import type { WordData } from "@/types/word";
import { Badge } from "../ui/badge";
import { ExampleItem } from "../word/example-word";

export function WordOfTheDay() {
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function loadWordOfDay() {
      try {
        const result = await getWordOfTheDayAction();
        if (result.success && result.data) {
          setWordData(result.data);
        }
      } catch (error) {
        console.error("Failed to load word", error);
      } finally {
        setIsLoading(false);
      }
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-8 space-y-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="col-span-12 md:col-span-4">
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!wordData) {
    return (
      <div className="text-center p-4">Unable to load Word of the Day.</div>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 md:col-span-6 order-2 md:order-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex flex-col gap-3 md:gap-6">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-3xl md:text-4xl font-extrabold text-primary">
                      {wordData.word}
                    </h3>
                    <span className="text-sm md:text-lg text-muted-foreground font-serif italic">
                      {wordData.ipa}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Badge
                      className="px-3 py-1 text-sm font-medium"
                      variant="warn"
                    >
                      {wordData.type}
                    </Badge>
                    <Badge
                      className="px-3 py-1 text-sm font-medium"
                      variant="band"
                    >
                      Band: {wordData.band}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <div>
                    Meaning:{" "}
                    <span className="text-md">{wordData.definition}</span>
                  </div>
                  <div>
                    Định nghĩa:{" "}
                    <span className="text-md">
                      {wordData.vietnameseDefinition}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm pt-4">
                  <div className="flex flex-wrap text-md gap-x-2">
                    <Badge variant="success">Synonyms:</Badge>
                    {wordData.synonym.map((synonym, index) => (
                      <span key={synonym}>
                        {synonym || "N/A"}
                        {index < wordData.synonym.length - 1 && ","}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap text-md gap-x-2">
                    <Badge variant="destructive">Antonyms:</Badge>
                    {wordData.antonym.map((antonym, index) => (
                      <span key={antonym}>
                        {antonym || "N/A"}
                        {index < wordData.antonym.length - 1 && ","}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                size="icon"
                variant="outline"
                className="rounded-full h-10 w-10 shrink-0 ml-4 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 border-2"
                onClick={speakWord}
                disabled={isPlaying}
              >
                <Volume2
                  className={`h-5 w-5 ${
                    isPlaying ? "animate-pulse text-yellow-500" : ""
                  }`}
                />
              </Button>
            </div>
          </div>

          <div className="col-span-12 md:col-span-6 order-1 md:order-2">
            {wordData.image && (
              <div className="w-full h-96 object-cover relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border shadow-sm">
                <img
                  src={wordData.image}
                  alt={wordData.image_prompt || wordData.word}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-dashed">
          {wordData.example.map((example) => (
            <ExampleItem key={example.sentence} data={example} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

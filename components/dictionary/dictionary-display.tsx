import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DictionaryEntry } from "@/lib/merriam-webster";
import { useState } from "react";
import { toast } from "sonner";
import { getPosColor } from "@/lib";

interface DictionaryDisplayProps {
  entry: DictionaryEntry;
}

export function DictionaryDisplay({ entry }: DictionaryDisplayProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  async function playPronunciation(audioUrl: string) {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      const audio = new Audio(audioUrl);
      await audio.play();
      audio.onended = () => setIsPlayingAudio(false);
    } catch {
      setIsPlayingAudio(false);
      toast.error("Failed to play audio");
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <CardTitle className="text-xl md:text-2xl uppercase">
              {entry.word}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-sm italic text-muted-foreground">
                /{entry.pronunciations[0].notation}/
              </div>
              <div>
                {entry.partOfSpeech && (
                  <Badge className={`${getPosColor(entry.partOfSpeech)}`}>
                    {entry.partOfSpeech}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div>
            {entry.pronunciations[0]?.audioUrl && (
              <Button
                size="icon"
                variant="outline"
                onClick={() =>
                  playPronunciation(entry.pronunciations[0].audioUrl!)
                }
                disabled={isPlayingAudio}
              >
                <Volume2
                  className={`h-4 w-4 ${isPlayingAudio ? "animate-pulse" : ""}`}
                />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-sm uppercase text-muted-foreground">
            Definitions
          </h3>
          <ol className="rounded list-decimal list-inside space-y-4">
            {entry.definitions.slice(0, 10).map((def) => (
              <div className="bg-muted/40 rounded-lg border-l-4 border-yellow-400 dark:border-yellow-600">
                <li key={def} className="p-4 text-base">
                  {def}
                </li>
              </div>
            ))}
          </ol>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-sm uppercase text-muted-foreground">
            Short Definitions
          </h3>
          <ol className="rounded list-decimal list-inside space-y-4">
            {entry.shortDefinitions.map((def) => (
              <div className="bg-muted/40 rounded-lg border-l-4 border-green-400 dark:border-green-600">
                <li key={def} className="p-4 text-base">
                  {def}
                </li>
              </div>
            ))}
          </ol>
        </div>

        {entry.examples.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground">
              Examples
            </h3>
            <ol className="rounded list-decimal list-inside space-y-4">
              {entry.examples.slice(0, 5).map((def) => (
                <div className="bg-muted/40 rounded-lg border-l-4 border-blue-400 dark:border-blue-600">
                  <li key={def} className="p-4 text-base">
                    {def}
                  </li>
                </div>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

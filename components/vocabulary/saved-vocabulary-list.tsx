"use client";

import { Bookmark, Trash2, Volume2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSavedWords, useUnsaveWord } from "@/hooks/use-queries";
import { TTSService } from "@/lib/tts";

interface SavedWord {
  id: string;
  wordId: string;
  context: string | null;
  savedAt: string;
  word: {
    id: string;
    word: string;
    translation: string;
    phonetic: string | null;
    difficulty: string;
    definition: string;
    examples: Array<{ sentence: string }>;
  };
}

export function SavedVocabularyList() {
  const [page, setPage] = useState(1);
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  const { data, isLoading } = useSavedWords(page);
  const unsaveMutation = useUnsaveWord();

  const savedWords = (data?.words ?? []) as unknown as SavedWord[];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  async function handleUnsave(wordId: string) {
    unsaveMutation.mutate(wordId);
  }

  async function playWord(word: string) {
    setPlayingWord(word);
    try {
      await TTSService.speak(word);
    } finally {
      setPlayingWord(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={`skeleton-${i}`} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (savedWords.length === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Saved Words</h3>
          <p className="text-muted-foreground">
            Save words while browsing vocabulary to review them later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} saved word{total !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {savedWords.map((saved) => (
          <Card key={saved.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{saved.word.word}</CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => playWord(saved.word.word)}
                    disabled={playingWord === saved.word.word}
                  >
                    <Volume2
                      className={`h-4 w-4 ${playingWord === saved.word.word ? "animate-pulse" : ""}`}
                    />
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline">{saved.word.difficulty}</Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleUnsave(saved.wordId)}
                    disabled={unsaveMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {saved.word.phonetic && (
                <p className="text-sm text-muted-foreground">
                  {saved.word.phonetic}
                </p>
              )}
              <p className="text-sm font-medium text-primary">
                {saved.word.translation}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {saved.word.definition}
              </p>
              {saved.context && (
                <p className="text-xs italic text-muted-foreground mt-2">
                  Context: "{saved.context}"
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

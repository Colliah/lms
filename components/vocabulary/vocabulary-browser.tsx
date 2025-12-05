"use client";

import { Search, Volume2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { browseWordsAction, getCategoriesAction } from "@/actions/vocabulary";
import type { ProficiencyLevel } from "@/app/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TTSService } from "@/lib/tts";

interface Word {
  id: string;
  word: string;
  translation: string;
  phonetic: string | null;
  difficulty: ProficiencyLevel;
  definition: string;
  examples: Array<{ sentence: string }>;
  categories: Array<{ id: string; name: string }>;
}

interface Category {
  id: string;
  name: string;
  wordCount: number;
}

const levels: (ProficiencyLevel | "ALL")[] = [
  "ALL",
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

const difficultyColors: Record<ProficiencyLevel, string> = {
  A1: "bg-emerald-500",
  A2: "bg-green-500",
  B1: "bg-yellow-500",
  B2: "bg-orange-500",
  C1: "bg-red-500",
  C2: "bg-purple-500",
};

export function VocabularyBrowser() {
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<ProficiencyLevel | "ALL">("ALL");
  const [categoryId, setCategoryId] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    getCategoriesAction().then((result) => {
      if (result.success && result.data) {
        setCategories(result.data);
      }
    });
  }, []);

  // Fetch words when filters change
  useEffect(() => {
    startTransition(async () => {
      const result = await browseWordsAction({
        difficulty: difficulty === "ALL" ? undefined : difficulty,
        categoryId: categoryId === "ALL" ? undefined : categoryId,
        search: search || undefined,
        page,
      });

      if (result.success && result.data) {
        setWords(result.data.words);
        setTotal(result.data.total);
        setTotalPages(result.data.totalPages);
      }
    });
  }, [difficulty, categoryId, search, page]);

  async function playWord(word: string) {
    setPlayingWord(word);
    try {
      await TTSService.speak(word);
    } finally {
      setPlayingWord(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search words..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={difficulty}
          onValueChange={(v) => {
            setDifficulty(v as ProficiencyLevel | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            {levels.map((level) => (
              <SelectItem key={level} value={level}>
                {level === "ALL" ? "All Levels" : level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={categoryId}
          onValueChange={(v) => {
            setCategoryId(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name} ({cat.wordCount})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">{total} words found</div>

      {/* Words Grid */}
      {isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <Skeleton>
            <Skeleton key={`skeleton-${i}`} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {words.map((word) => (
            <Card key={word.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{word.word}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => playWord(word.word)}
                      disabled={playingWord === word.word}
                    >
                      <Volume2
                        className={`h-4 w-4 ${playingWord === word.word ? "animate-pulse" : ""}`}
                      />
                    </Button>
                  </div>
                  <Badge
                    className={`${difficultyColors[word.difficulty]} text-white`}
                  >
                    {word.difficulty}
                  </Badge>
                </div>

                {word.phonetic && (
                  <p className="text-sm text-muted-foreground">
                    {word.phonetic}
                  </p>
                )}

                <p className="text-sm font-medium text-primary">
                  {word.translation}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {word.definition}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
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

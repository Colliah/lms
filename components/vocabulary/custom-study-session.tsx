"use client";

import { BookOpen, GraduationCap, Play, RefreshCw } from "lucide-react";
import { useState } from "react";
import { createStudySessionAction } from "@/actions/study-session";
import type { ProficiencyLevel } from "@/app/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { useStudySessionOptions } from "@/hooks/use-queries";
import VocabularyLearning from "./vocabulary-learning";

interface StudyWord {
  id: string;
  word: string;
  translation: string;
  phonetic: string | null;
  difficulty: ProficiencyLevel;
  definition: string;
  audios: Array<{ url: string }>;
  images: Array<{ url: string }>;
  examples: Array<{ sentence: string; translation: string; highlight: string }>;
  isReview: boolean;
}

export function CustomStudySession() {
  const { data: options, isLoading, refetch } = useStudySessionOptions();
  const [isCreating, setIsCreating] = useState(false);

  // Session config
  const [difficulty, setDifficulty] = useState<ProficiencyLevel | "ALL">("ALL");
  const [categoryId, setCategoryId] = useState<string>("ALL");
  const [wordCount, setWordCount] = useState(10);
  const [includeNew, setIncludeNew] = useState(true);
  const [includeReview, setIncludeReview] = useState(true);

  // Active session
  const [sessionWords, setSessionWords] = useState<StudyWord[] | null>(null);

  async function startSession() {
    setIsCreating(true);
    const result = await createStudySessionAction({
      difficulty: difficulty === "ALL" ? undefined : difficulty,
      categoryId: categoryId === "ALL" ? undefined : categoryId,
      wordCount,
      includeNew,
      includeReview,
    });

    if (result.success && result.data) {
      setSessionWords(result.data.words as StudyWord[]);
    }
    setIsCreating(false);
  }

  function endSession() {
    setSessionWords(null);
    refetch(); // Refresh counts
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-12" />
      </div>
    );
  }

  if (!options) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Unable to load study options
        </CardContent>
      </Card>
    );
  }

  // Show active session
  if (sessionWords) {
    if (sessionWords.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">No Words Available</h3>
            <p className="text-muted-foreground">
              No words match your selected criteria. Try adjusting your filters.
            </p>
            <Button onClick={endSession} variant="outline">
              Back to Settings
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Custom Study Session: {sessionWords.length} words
          </div>
          <Button onClick={endSession} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>
        <VocabularyLearning words={sessionWords} />
      </div>
    );
  }

  const maxWords = Math.min(
    50,
    (includeReview ? options.dueReviewCount : 0) +
      (includeNew ? options.newWordsCount : 0),
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Create Custom Study Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Word Types */}
          <div className="space-y-3">
            <Label className="text-base">Word Types</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-review"
                  checked={includeReview}
                  onCheckedChange={(checked) =>
                    setIncludeReview(checked as boolean)
                  }
                />
                <Label htmlFor="include-review" className="cursor-pointer">
                  Review ({options.dueReviewCount} due)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-new"
                  checked={includeNew}
                  onCheckedChange={(checked) =>
                    setIncludeNew(checked as boolean)
                  }
                />
                <Label htmlFor="include-new" className="cursor-pointer">
                  New Words ({options.newWordsCount} available)
                </Label>
              </div>
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <Select
              value={difficulty}
              onValueChange={(v) =>
                setDifficulty(v as ProficiencyLevel | "ALL")
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Levels</SelectItem>
                {options.levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {options.categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name} ({cat.wordCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Word Count */}
          <div className="space-y-3">
            <Label>Number of Words: {wordCount}</Label>
            <Slider
              value={[wordCount]}
              onValueChange={([v]) => setWordCount(v)}
              min={5}
              max={Math.max(5, maxWords)}
              step={5}
              className="w-full max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              Maximum available: {maxWords} words
            </p>
          </div>

          {/* Start Button */}
          <Button
            onClick={startSession}
            disabled={
              isCreating || (!includeNew && !includeReview) || maxWords === 0
            }
            size="lg"
            className="w-full sm:w-auto"
          >
            {isCreating ? (
              <>Creating Session...</>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

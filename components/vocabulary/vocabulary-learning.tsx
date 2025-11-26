"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitVocabularyReviewAction } from "@/actions/vocabulary";
import type { ReviewQuality } from "@/app/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Flashcard from "./flashcard";
import ReviewButtons from "./review-buttons";

interface Word {
  id: string;
  word: string;
  translation: string;
  phonetic: string | null;
  definition: string;
  audios: Array<{ url: string }>;
  images: Array<{ url: string }>;
  examples: Array<{
    sentence: string;
    translation: string;
    highlight: string;
  }>;
  isReview: boolean;
}

interface VocabularyLearningProps {
  words: Word[];
}

export default function VocabularyLearning({ words }: VocabularyLearningProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const currentWord = words[currentIndex];
  const progress = (currentIndex / words.length) * 100;

  async function handleReview(quality: ReviewQuality) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    if (currentWord.isReview) {
      await submitVocabularyReviewAction({
        wordId: currentWord.id,
        quality,
      });
    }

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setIsSubmitting(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} / {words.length} words
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <Flashcard
        word={currentWord}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped(!isFlipped)}
      />

      {isFlipped && (
        <ReviewButtons
          onReview={handleReview}
          isSubmitting={isSubmitting}
          isNewWord={!currentWord.isReview}
        />
      )}
    </div>
  );
}

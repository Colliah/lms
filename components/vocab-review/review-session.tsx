"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AudioButton } from "@/components/vocab-cards/audio-button";
import { submitReviewAction } from "@/actions/vocab-review";
import { toast } from "sonner";
import Link from "next/link";
import type { VocabCard, VocabCategory } from "@/types/vocab";

interface ReviewSessionProps {
  category: Pick<VocabCategory, "id" | "name">;
  cards: VocabCard[];
  isPracticeMode?: boolean;
  basePath?: string;
}

interface ReviewButton {
  quality: number;
  label: string;
  description: string;
  color: string;
}

const reviewButtons: ReviewButton[] = [
  {
    quality: 0,
    label: "Again",
    description: "Forgot completely",
    color: "bg-red-500 hover:bg-red-600 text-white",
  },
  {
    quality: 3,
    label: "Hard",
    description: "Recalled with difficulty",
    color: "bg-amber-500 hover:bg-amber-600 text-white",
  },
  {
    quality: 4,
    label: "Good",
    description: "Recalled correctly",
    color: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  {
    quality: 5,
    label: "Easy",
    description: "Perfect recall",
    color: "bg-emerald-500 hover:bg-emerald-600 text-white",
  },
];

export function ReviewSession({
  category,
  cards,
  isPracticeMode = false,
  basePath = "/vocab",
}: ReviewSessionProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const categoryPath = `${basePath}/${category.id}`;
  const currentCard = cards[currentIndex];
  const isComplete = currentIndex >= cards.length;
  const progressPercent = (completedCount / cards.length) * 100;

  const handleReview = useCallback(
    async (quality: number) => {
      if (!currentCard || isSubmitting) return;

      setIsSubmitting(true);

      try {
        const result = await submitReviewAction(currentCard.id, quality);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        setCompletedCount((prev) => prev + 1);
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } catch {
        toast.error("Failed to submit review");
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentCard, isSubmitting]
  );

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
        <h2 className="text-2xl font-bold">
          {isPracticeMode ? "No cards yet!" : "All caught up!"}
        </h2>
        <p className="text-muted-foreground mt-2">
          {isPracticeMode
            ? "Add some cards to this category to start practicing."
            : "No cards are due for review in this category."}
        </p>
        <div className="flex gap-4 mt-6">
          <Button asChild>
            <Link href={categoryPath}>Back to Category</Link>
          </Button>
          {!isPracticeMode && (
            <Button asChild variant="outline">
              <Link href={`${categoryPath}/review?mode=practice`}>
                Practice All
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
        <h2 className="text-2xl font-bold">Session Complete!</h2>
        <p className="text-muted-foreground mt-2">
          You reviewed {completedCount}{" "}
          {completedCount === 1 ? "card" : "cards"}.
        </p>
        <div className="flex gap-4 mt-6">
          <Button asChild variant="outline">
            <Link href={categoryPath}>Back to Category</Link>
          </Button>
          <Button
            onClick={() => {
              setCurrentIndex(0);
              setCompletedCount(0);
              router.refresh();
            }}
          >
            Review Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href={categoryPath}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {category.name}
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Progress bar */}
      <Progress value={progressPercent} className="h-2" />

      {/* Flashcard */}
      <div className="flex justify-center">
        <div
          className="w-full max-w-lg cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <Card className="min-h-[350px] transition-transform hover:scale-[1.01]">
            <CardContent className="p-0">
              {!isFlipped ? (
                /* Front of card */
                <div className="flex flex-col items-center justify-center min-h-[350px] p-8 text-center">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      {currentCard.partOfSpeech}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-4xl font-bold">{currentCard.word}</h2>
                    <AudioButton
                      text={currentCard.word}
                      className="h-10 w-10"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Click to reveal answer
                  </p>
                </div>
              ) : (
                /* Back of card */
                <div className="flex flex-col min-h-[350px] p-8">
                  <div className="text-center border-b pb-4 mb-4">
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="text-2xl font-bold">{currentCard.word}</h2>
                      <AudioButton text={currentCard.word} />
                    </div>
                    <span className="text-sm text-muted-foreground capitalize">
                      {currentCard.partOfSpeech}
                    </span>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                        Meaning
                      </h3>
                      <p className="text-lg">{currentCard.meaning}</p>
                    </div>

                    {currentCard.exampleSentence && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                          Example
                        </h3>
                        <p className="italic text-muted-foreground">
                          "{currentCard.exampleSentence}"
                        </p>
                      </div>
                    )}

                    {currentCard.note && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                          Notes
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {currentCard.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review buttons - shown when flipped */}
      {isFlipped && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            How well did you recall this?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {reviewButtons.map((btn) => (
              <Button
                key={btn.quality}
                onClick={() => handleReview(btn.quality)}
                disabled={isSubmitting}
                className={`min-w-[100px] ${btn.color}`}
              >
                <div className="text-center">
                  <div className="font-semibold">{btn.label}</div>
                  <div className="text-xs opacity-80">{btn.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Flip hint when not flipped */}
      {!isFlipped && (
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsFlipped(true)}
          >
            Show Answer
          </Button>
        </div>
      )}
    </div>
  );
}

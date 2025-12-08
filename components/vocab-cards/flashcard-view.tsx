"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { AudioButton } from "./audio-button";
import { MasteryBadge } from "./mastery-badge";
import type { VocabCard } from "@/types/vocab";

interface FlashcardViewProps {
  card: VocabCard;
  className?: string;
}

export function FlashcardView({ card, className }: FlashcardViewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  function handleFlip() {
    setIsFlipped(!isFlipped);
  }

  return (
    <div
      className={cn("perspective-1000 cursor-pointer select-none", className)}
      onClick={handleFlip}
    >
      <div
        className={cn(
          "relative w-full transition-transform duration-500 transform-style-3d",
          isFlipped && "rotate-y-180"
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <Card
          className={cn(
            "w-full min-h-[300px] backface-hidden absolute inset-0",
            "flex flex-col"
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <MasteryBadge level={card.masteryLevel} className="mb-4" />

            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold">{card.word}</h2>
              <AudioButton text={card.word} className="h-10 w-10" />
            </div>

            <span className="text-sm text-muted-foreground capitalize mt-2">
              {card.partOfSpeech}
            </span>

            <p className="text-sm text-muted-foreground mt-6">
              Click to reveal meaning
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "w-full min-h-[300px] backface-hidden",
            "flex flex-col bg-primary/5"
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <CardContent className="flex-1 flex flex-col p-8">
            <div className="flex-1 space-y-4">
              <div className="text-center border-b pb-4">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-2xl font-bold">{card.word}</h2>
                  <AudioButton text={card.word} />
                </div>
                <span className="text-sm text-muted-foreground capitalize">
                  {card.partOfSpeech}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Meaning
                </h3>
                <p className="text-lg">{card.meaning}</p>
              </div>

              {card.exampleSentence && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Example
                  </h3>
                  <p className="italic text-muted-foreground">
                    "{card.exampleSentence}"
                  </p>
                </div>
              )}

              {/* Notes */}
              {card.note && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Notes
                  </h3>
                  <p className="text-sm text-muted-foreground">{card.note}</p>
                </div>
              )}

              {/* Image */}
              {card.image && (
                <div className="flex justify-center">
                  <img
                    src={card.image}
                    alt={card.word}
                    className="max-h-32 rounded-lg object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground text-center mt-4">
              Click to flip back
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

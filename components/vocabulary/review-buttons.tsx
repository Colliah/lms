"use client";

import { ReviewQuality } from "@/app/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ReviewButtonsProps {
  onReview: (quality: ReviewQuality) => void;
  isSubmitting: boolean;
  isNewWord: boolean;
}

export default function ReviewButtons({
  onReview,
  isSubmitting,
  isNewWord,
}: ReviewButtonsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-center">
            {isNewWord
              ? "How well do you know this word?"
              : "How well did you remember?"}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => onReview(ReviewQuality.AGAIN)}
              disabled={isSubmitting}
              variant="destructive"
              className="h-16 flex-col"
            >
              <span className="font-semibold">Again</span>
              <span className="text-xs opacity-90">&lt;1 day</span>
            </Button>
            <Button
              onClick={() => onReview(ReviewQuality.HARD)}
              disabled={isSubmitting}
              variant="outline"
              className="h-16 flex-col border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950"
            >
              <span className="font-semibold">Hard</span>
              <span className="text-xs opacity-90">1-3 days</span>
            </Button>
            <Button
              onClick={() => onReview(ReviewQuality.GOOD)}
              disabled={isSubmitting}
              variant="outline"
              className="h-16 flex-col border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <span className="font-semibold">Good</span>
              <span className="text-xs opacity-90">3-7 days</span>
            </Button>
            <Button
              onClick={() => onReview(ReviewQuality.EASY)}
              disabled={isSubmitting}
              variant="outline"
              className="h-16 flex-col border-green-500 hover:bg-green-50 dark:hover:bg-green-950"
            >
              <span className="font-semibold">Easy</span>
              <span className="text-xs opacity-90">7+ days</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

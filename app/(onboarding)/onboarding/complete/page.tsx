"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { completeOnboardingAction } from "@/actions/onboarding";
import type {
  LearningGoal,
  LearningStyle,
  ProficiencyLevel,
} from "@/app/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CompletePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = useCallback(
    async function handleSubmit() {
      setIsSubmitting(true);
      setError(null);

      try {
        // Retrieve all onboarding data from sessionStorage
        const level = sessionStorage.getItem(
          "onboarding_level",
        ) as ProficiencyLevel;
        const score = parseInt(
          sessionStorage.getItem("onboarding_score") || "0",
          10,
        );
        const goals = JSON.parse(
          sessionStorage.getItem("onboarding_goals") || "[]",
        ) as LearningGoal[];
        const dailyCommitment = parseInt(
          sessionStorage.getItem("onboarding_daily_commitment") || "15",
          10,
        );
        const learningStyle = sessionStorage.getItem(
          "onboarding_learning_style",
        ) as LearningStyle;

        const result = await completeOnboardingAction({
          currentLevel: level,
          assessmentScore: score,
          goals,
          dailyCommitment,
          learningStyle,
          interests: goals, // Using goals as interests for now
        });

        if (result.success) {
          // Clear sessionStorage
          sessionStorage.removeItem("onboarding_level");
          sessionStorage.removeItem("onboarding_score");
          sessionStorage.removeItem("onboarding_goals");
          sessionStorage.removeItem("onboarding_daily_commitment");
          sessionStorage.removeItem("onboarding_learning_style");

          // Wait a moment then redirect
          setTimeout(() => {
            router.push("/");
          }, 2000);
        } else {
          setError(result.error || "Failed to complete onboarding");
          setIsSubmitting(false);
        }
      } catch {
        setError("An unexpected error occurred");
        setIsSubmitting(false);
      }
    },
    [router],
  );

  useEffect(() => {
    // Auto-submit when component mounts
    handleSubmit();
  }, [handleSubmit]);

  if (error) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">Error</div>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={handleSubmit}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-12 text-center space-y-6">
        {isSubmitting ? (
          <>
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
            <h2 className="text-2xl font-bold">Setting up your profile...</h2>
            <p className="text-muted-foreground">
              This will just take a moment
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
            <h2 className="text-2xl font-bold">Welcome aboard!</h2>
            <p className="text-muted-foreground">
              Your personalized learning journey is ready. Redirecting you to
              the dashboard...
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

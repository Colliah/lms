"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import OnboardingCard from "@/components/onboarding/onboarding-card";
import OnboardingProgress from "@/components/onboarding/onboarding-progress";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function SchedulePage() {
  const [dailyMinutes, setDailyMinutes] = useState([15]);
  const router = useRouter();

  function handleNext() {
    sessionStorage.setItem(
      "onboarding_daily_commitment",
      dailyMinutes[0].toString(),
    );
    router.push("/onboarding/style");
  }

  function handleBack() {
    router.push("/onboarding/goals");
  }

  return (
    <div className="space-y-6">
      <OnboardingProgress currentStep={3} totalSteps={4} />

      <OnboardingCard
        title="Study Schedule"
        description="How much time can you commit to learning each day?"
      >
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">
                {dailyMinutes[0]}
              </div>
              <div className="text-muted-foreground">minutes per day</div>
            </div>

            <Slider
              value={dailyMinutes}
              onValueChange={setDailyMinutes}
              min={5}
              max={120}
              step={5}
              className="py-4"
            />

            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div className="text-left">5 min</div>
              <div className="text-center">60 min</div>
              <div className="text-right">120 min</div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {dailyMinutes[0] < 15
                ? "Even a few minutes daily will help you improve!"
                : dailyMinutes[0] < 30
                  ? "Great start! This amount will build a solid foundation."
                  : dailyMinutes[0] < 60
                    ? "Excellent commitment! You'll see rapid progress."
                    : "Amazing dedication! You're on track for fluency."}
            </p>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </div>
      </OnboardingCard>
    </div>
  );
}

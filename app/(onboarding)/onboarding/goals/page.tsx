"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LearningGoal } from "@/app/generated/prisma/enums";
import OnboardingCard from "@/components/onboarding/onboarding-card";
import OnboardingProgress from "@/components/onboarding/onboarding-progress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const goalOptions: Array<{
  value: LearningGoal;
  label: string;
  description: string;
}> = [
  {
    value: "GENERAL",
    label: "General English",
    description: "Improve overall English skills",
  },
  {
    value: "BUSINESS",
    label: "Business English",
    description: "Professional communication and business vocabulary",
  },
  {
    value: "TRAVEL",
    label: "Travel",
    description: "Essential phrases for traveling abroad",
  },
  {
    value: "ACADEMIC",
    label: "Academic",
    description: "English for university or research",
  },
  {
    value: "CONVERSATION",
    label: "Conversation",
    description: "Speaking and listening practice",
  },
];

export default function GoalsPage() {
  const [selectedGoals, setSelectedGoals] = useState<LearningGoal[]>([]);
  const router = useRouter();

  function toggleGoal(goal: LearningGoal) {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  }

  function handleNext() {
    sessionStorage.setItem("onboarding_goals", JSON.stringify(selectedGoals));
    router.push("/onboarding/schedule");
  }

  function handleBack() {
    router.push("/onboarding/assessment");
  }

  return (
    <div className="space-y-6">
      <OnboardingProgress currentStep={2} totalSteps={4} />

      <OnboardingCard
        title="Learning Goals"
        description="What would you like to focus on? Select all that apply."
      >
        <div className="space-y-6">
          <div className="space-y-3">
            {goalOptions.map((option) => (
              <label
                key={option.value}
                htmlFor={option.value}
                className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent cursor-pointer"
              >
                <Checkbox
                  id={option.value}
                  checked={selectedGoals.includes(option.value)}
                  onCheckedChange={() => toggleGoal(option.value)}
                />
                <div className="flex-1">
                  <div className="cursor-pointer font-medium">
                    {option.label}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={selectedGoals.length === 0}>
              Next
            </Button>
          </div>
        </div>
      </OnboardingCard>
    </div>
  );
}

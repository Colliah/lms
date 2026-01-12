"use client";

import { BookOpen, Eye, Hand, Headphones } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LearningStyle } from "@/app/generated/prisma/enums";
import OnboardingCard from "@/components/onboarding/onboarding-card";
import OnboardingProgress from "@/components/onboarding/onboarding-progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const styleOptions: Array<{
  value: LearningStyle;
  label: string;
  description: string;
  icon: any;
}> = [
  {
    value: "VISUAL",
    label: "Visual",
    description: "You learn best with images, charts, and diagrams",
    icon: Eye,
  },
  {
    value: "AUDITORY",
    label: "Auditory",
    description: "You prefer listening to explanations and audio content",
    icon: Headphones,
  },
  {
    value: "KINESTHETIC",
    label: "Kinesthetic",
    description: "You learn by doing and hands-on practice",
    icon: Hand,
  },
  {
    value: "READING_WRITING",
    label: "Reading/Writing",
    description: "You excel with written materials and note-taking",
    icon: BookOpen,
  },
];

export default function StylePage() {
  const [selectedStyle, setSelectedStyle] = useState<LearningStyle | null>(
    null,
  );
  const router = useRouter();

  function handleNext() {
    if (!selectedStyle) return;
    sessionStorage.setItem("onboarding_learning_style", selectedStyle);
    router.push("/onboarding/complete");
  }

  function handleBack() {
    router.push("/onboarding/schedule");
  }

  return (
    <div className="space-y-6">
      <OnboardingProgress currentStep={4} totalSteps={4} />

      <OnboardingCard
        title="Learning Style"
        description="How do you prefer to learn?"
      >
        <div className="space-y-6">
          <RadioGroup
            value={selectedStyle || ""}
            onValueChange={(value) => setSelectedStyle(value as LearningStyle)}
          >
            {styleOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent cursor-pointer"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div className="flex-1 flex items-start gap-3">
                    <Icon className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <span className="font-medium block">{option.label}</span>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={!selectedStyle}>
              Complete Setup
            </Button>
          </div>
        </div>
      </OnboardingCard>
    </div>
  );
}

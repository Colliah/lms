"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProficiencyLevel } from "@/app/generated/prisma/enums";
import OnboardingCard from "@/components/onboarding/onboarding-card";
import OnboardingProgress from "@/components/onboarding/onboarding-progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const questions = [
  {
    id: 1,
    question: "Which sentence is correct?",
    options: [
      "I am go to school",
      "I go to school",
      "I goes to school",
      "I going to school",
    ],
    correct: 1,
  },
  {
    id: 2,
    question: "Choose the correct past tense: She ___ to the store yesterday.",
    options: ["go", "goes", "went", "going"],
    correct: 2,
  },
  {
    id: 3,
    question: "What is the opposite of 'difficult'?",
    options: ["hard", "easy", "simple", "light"],
    correct: 1,
  },
  {
    id: 4,
    question: "If I ___ rich, I would travel the world.",
    options: ["am", "was", "were", "be"],
    correct: 2,
  },
  {
    id: 5,
    question: "The meeting has been ___ until next week.",
    options: ["postponed", "advanced", "proceeded", "attended"],
    correct: 0,
  },
];

export default function AssessmentPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const router = useRouter();

  function handleNext() {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Calculate score and determine level
      const correctCount = newAnswers.reduce((sum, answer, idx) => {
        return sum + (answer === questions[idx].correct ? 1 : 0);
      }, 0);

      let level: ProficiencyLevel;
      if (correctCount <= 1) level = "A1";
      else if (correctCount === 2) level = "A2";
      else if (correctCount === 3) level = "B1";
      else if (correctCount === 4) level = "B2";
      else level = "C1";

      // Store level in sessionStorage and proceed
      sessionStorage.setItem("onboarding_level", level);
      sessionStorage.setItem("onboarding_score", correctCount.toString());
      router.push("/onboarding/goals");
    }
  }

  function handleBack() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]);
      setAnswers(answers.slice(0, -1));
    } else {
      router.push("/onboarding");
    }
  }

  const question = questions[currentQuestion];

  return (
    <div className="space-y-6">
      <OnboardingProgress currentStep={1} totalSteps={4} />

      <OnboardingCard
        title="Level Assessment"
        description={`Question ${currentQuestion + 1} of ${questions.length}`}
      >
        <div className="space-y-6">
          <div className="text-lg font-medium">{question.question}</div>

          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => setSelectedAnswer(parseInt(value, 10))}
          >
            {question.options.map((option, idx) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                <Label htmlFor={`option-${idx}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={selectedAnswer === null}>
              {currentQuestion < questions.length - 1
                ? "Next"
                : "Complete Assessment"}
            </Button>
          </div>
        </div>
      </OnboardingCard>
    </div>
  );
}

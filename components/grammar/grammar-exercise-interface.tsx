"use client";

import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitGrammarExerciseAction } from "@/app/actions/grammar";
import type { ExerciseType } from "@/app/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Question {
  id: string;
  type: ExerciseType;
  question: string;
  options: string[];
  orderIndex: number;
}

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
}

interface GrammarExerciseInterfaceProps {
  exercises: Exercise[];
}

export default function GrammarExerciseInterface({
  exercises,
}: GrammarExerciseInterfaceProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const currentExercise = exercises[currentExerciseIndex];

  async function handleSubmit() {
    setIsSubmitting(true);
    const result = await submitGrammarExerciseAction({
      exerciseId: currentExercise.id,
      answers,
    });

    if (result.success && result.data) {
      setFeedback(result.data.feedback);
      setIsSubmitted(true);
    }
    setIsSubmitting(false);
  }

  function handleNextExercise() {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setAnswers({});
      setIsSubmitted(false);
      setFeedback(null);
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
          Exercise {currentExerciseIndex + 1} of {exercises.length}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentExercise.title}</CardTitle>
          {currentExercise.description && (
            <p className="text-sm text-muted-foreground">
              {currentExercise.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {currentExercise.questions.map((question) => (
            <div key={question.id} className="space-y-3">
              <h3 className="font-medium">{question.question}</h3>

              {question.type === "MULTIPLE_CHOICE" &&
              question.options.length > 0 ? (
                <RadioGroup
                  value={answers[question.id] || ""}
                  onValueChange={(value) =>
                    setAnswers({ ...answers, [question.id]: value })
                  }
                  disabled={isSubmitted}
                >
                  {question.options.map((option, idx) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={option}
                        id={`${question.id}-${idx}`}
                      />
                      <Label
                        htmlFor={`${question.id}-${idx}`}
                        className="cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Input
                  placeholder="Type your answer here..."
                  value={answers[question.id] || ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [question.id]: e.target.value })
                  }
                  disabled={isSubmitted}
                />
              )}

              {isSubmitted && feedback && feedback[question.id] && (
                <div
                  className={`p-4 rounded-lg border ${
                    feedback[question.id].isCorrect
                      ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                      : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {feedback[question.id].isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">
                        {feedback[question.id].isCorrect
                          ? "Correct!"
                          : "Incorrect"}
                      </p>
                      {!feedback[question.id].isCorrect && (
                        <p className="text-sm">
                          Correct answer: {feedback[question.id].correctAnswer}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {feedback[question.id].explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        {!isSubmitted ? (
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              Object.keys(answers).length !== currentExercise.questions.length
            }
            size="lg"
          >
            {isSubmitting ? "Submitting..." : "Submit Answers"}
          </Button>
        ) : (
          <Button onClick={handleNextExercise} size="lg">
            {currentExerciseIndex < exercises.length - 1
              ? "Next Exercise"
              : "Finish"}
          </Button>
        )}
      </div>
    </div>
  );
}

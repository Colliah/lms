"use client";

import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { submitReadingAnswersAction } from "@/actions/reading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Question {
  id: string;
  question: string;
  options: string[];
  orderIndex: number;
}

interface Passage {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  questions: Question[];
}

interface ReadingPassageInterfaceProps {
  passage: Passage;
}

export default function ReadingPassageInterface({
  passage,
}: ReadingPassageInterfaceProps) {
  const [startTime] = useState(Date.now());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setReadingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  async function handleSubmit() {
    const readingTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    setIsSubmitting(true);

    const submitResult = await submitReadingAnswersAction({
      passageId: passage.id,
      answers,
      readingTimeSeconds,
    });

    if (submitResult.success && submitResult.data) {
      setResult(submitResult.data);
      setIsSubmitted(true);
    }
    setIsSubmitting(false);
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {formatTime(readingTime)}
        </div>
      </div>

      {!isSubmitted ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{passage.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {passage.wordCount} words
              </p>
            </CardHeader>
            <CardContent>
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                {passage.content.split("\n").map((paragraph, idx) => (
                  <p key={paragraph} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comprehension Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {passage.questions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <h3 className="font-medium">{question.question}</h3>
                  <RadioGroup
                    value={answers[question.id] || ""}
                    onValueChange={(value) =>
                      setAnswers({ ...answers, [question.id]: value })
                    }
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
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                Object.keys(answers).length !== passage.questions.length
              }
              size="lg"
            >
              {isSubmitting ? "Submitting..." : "Submit Answers"}
            </Button>
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-primary">
                  {result?.score}%
                </div>
                <p className="text-sm text-muted-foreground mt-1">Score</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-primary">
                  {result?.wordsPerMinute}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Words/Min</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-primary">
                  {formatTime(Math.floor((Date.now() - startTime) / 1000))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Time</p>
              </div>
            </div>

            {result?.completed ? (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  Congratulations! You passed this reading exercise! 🎉
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                  Keep practicing! You need 70% or higher to pass.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={() => router.push("/")} variant="outline">
                Back to Dashboard
              </Button>
              <Button onClick={() => router.refresh()}>
                Try Another Passage
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

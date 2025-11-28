"use client";

import { CheckCircle2, Loader2, Sparkles, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { generateQuizAction } from "@/actions/quiz-generator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QuizQuestion } from "@/lib/quiz-generator";

export function QuizGenerator() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<"A" | "B" | "C">("B");
  const [type, setType] = useState<"Multiple Choice" | "Fill-in-the-blank">(
    "Multiple Choice",
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  async function handleGenerate() {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    setQuestions([]);
    setSelectedAnswers([]);
    setShowResults(false);
    setCurrentQuestion(0);

    const result = await generateQuizAction(topic, level, type);

    if (result.success && result.data && result.data.length > 0) {
      setQuestions(result.data);
      setSelectedAnswers(new Array(result.data.length).fill(""));
      toast.success(`Generated ${result.data.length} questions!`);
    } else {
      toast.error("Failed to generate quiz");
    }

    setIsGenerating(false);
  }

  function handleAnswer(answer: string) {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answer;
    setSelectedAnswers(newAnswers);
  }

  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  }

  function previousQuestion() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }

  function submitQuiz() {
    setShowResults(true);
  }

  const score = showResults
    ? selectedAnswers.filter((ans, i) => ans === questions[i].Correct_Answer)
        .length
    : 0;

  const currentQ = questions[currentQuestion];

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      {questions.length === 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <CardTitle>AI Quiz Generator</CardTitle>
            </div>
            <CardDescription>
              Generate custom practice quizzes on any topic
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Present Perfect, Conditionals, Business Vocabulary"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={level}
                  onValueChange={(v) => setLevel(v as "A" | "B" | "C")}
                >
                  <SelectTrigger id="level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A (Beginner)</SelectItem>
                    <SelectItem value="B">B (Intermediate)</SelectItem>
                    <SelectItem value="C">C (Advanced)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Question Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as any)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Multiple Choice">
                      Multiple Choice
                    </SelectItem>
                    <SelectItem value="Fill-in-the-blank">
                      Fill-in-the-blank
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Quiz
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quiz Display */}
      {questions.length > 0 && !showResults && currentQ && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Question {currentQuestion + 1} of {questions.length}
              </CardTitle>
              <Badge variant="outline">{topic}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-lg font-medium">{currentQ.Question}</p>
              {currentQ.Base_Word && (
                <p className="text-sm text-muted-foreground mt-2">
                  Base word: <strong>{currentQ.Base_Word}</strong>
                </p>
              )}
            </div>

            {type === "Multiple Choice" ? (
              <RadioGroup
                value={selectedAnswers[currentQuestion]}
                onValueChange={handleAnswer}
              >
                {["A", "B", "C", "D", "E"].map((option) => {
                  const optionKey = `Option_${option}` as keyof QuizQuestion;
                  const optionText = currentQ[optionKey];
                  if (!optionText) return null;

                  return (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="cursor-pointer flex-1">
                        {option}. {optionText}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            ) : (
              <Input
                placeholder="Type your answer..."
                value={selectedAnswers[currentQuestion]}
                onChange={(e) => handleAnswer(e.target.value)}
              />
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={submitQuiz}
                  disabled={!selectedAnswers[currentQuestion]}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={nextQuestion}>Next</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Results
              <Badge
                variant={
                  score >= questions.length * 0.7 ? "default" : "secondary"
                }
              >
                {score}/{questions.length} (
                {Math.round((score / questions.length) * 100)}%)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((q, i) => (
              <div key={q.Question} className="border-b pb-4 last:border-0">
                <div className="flex items-start gap-2">
                  {selectedAnswers[i] === q.Correct_Answer ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">
                      Q{i + 1}: {q.Question}
                    </p>
                    <p className="text-sm mt-1">
                      Your answer:{" "}
                      <strong>{selectedAnswers[i] || "Not answered"}</strong>
                    </p>
                    <p className="text-sm text-green-600">
                      Correct answer: <strong>{q.Correct_Answer}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {q.Explanation}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setQuestions([]);
                setShowResults(false);
              }}
            >
              Generate New Quiz
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

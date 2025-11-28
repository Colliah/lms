import { Sparkles } from "lucide-react";
import { QuizGenerator } from "@/components/ai/quiz-generator";

export default function QuizPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          <h1 className="text-3xl font-bold tracking-tight">
            AI Quiz Generator
          </h1>
        </div>
        <p className="text-muted-foreground">
          Generate custom practice quizzes on any English topic with AI
        </p>
      </div>

      <QuizGenerator />
    </div>
  );
}

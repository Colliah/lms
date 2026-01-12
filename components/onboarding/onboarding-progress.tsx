import { Progress } from "@/components/ui/progress";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingProgress({
  currentStep,
  totalSteps,
}: OnboardingProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-2xl space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

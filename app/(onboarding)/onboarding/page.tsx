import { BookOpen, GraduationCap, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import OnboardingCard from "@/components/onboarding/onboarding-card";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to English LMS!
        </h1>
        <p className="text-muted-foreground text-lg">
          Your personalized journey to English fluency starts here
        </p>
      </div>

      <OnboardingCard
        title="What to Expect"
        description="We'll help you get started in just a few steps"
      >
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Assess Your Level</h3>
              <p className="text-sm text-muted-foreground">
                Quick quiz to determine your current proficiency
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Set Your Goals</h3>
              <p className="text-sm text-muted-foreground">
                Choose what you want to achieve
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Customize Your Experience</h3>
              <p className="text-sm text-muted-foreground">
                Set your study schedule and preferences
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Link href="/onboarding/assessment" className="block">
              <Button className="w-full" size="lg">
                Get Started
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="ghost" className="w-full">
                Skip for Now
              </Button>
            </Link>
          </div>
        </div>
      </OnboardingCard>
    </div>
  );
}

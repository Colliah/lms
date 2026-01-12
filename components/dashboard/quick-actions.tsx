import { ArrowRight, BookMarked, BookOpen, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface QuickActionsProps {
  vocabStats: {
    dueReviews: number;
    totalWords: number;
  };
}

export default function QuickActions({ vocabStats }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Continue your learning journey</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/vocabulary" className="block">
          <Button
            variant="default"
            className="w-full justify-between"
            size="lg"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span>Review Vocabulary</span>
            </div>
            <div className="flex items-center gap-2">
              {vocabStats.dueReviews > 0 && (
                <span className="text-xs bg-primary-foreground text-primary px-2 py-0.5 rounded-full">
                  {vocabStats.dueReviews}
                </span>
              )}
              <ArrowRight className="h-4 w-4" />
            </div>
          </Button>
        </Link>

        <Link href="/grammar" className="block">
          <Button
            variant="outline"
            className="w-full justify-between"
            size="lg"
          >
            <div className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              <span>Grammar Practice</span>
            </div>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        <Link href="/reading" className="block">
          <Button
            variant="outline"
            className="w-full justify-between"
            size="lg"
          >
            <div className="flex items-center gap-2">
              <BookMarked className="h-5 w-5" />
              <span>Reading Session</span>
            </div>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

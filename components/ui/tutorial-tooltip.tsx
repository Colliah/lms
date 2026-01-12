"use client";

import { HelpCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TutorialTooltipProps {
  id: string;
  children: React.ReactNode;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function TutorialTooltip({
  id,
  children,
  content,
  side = "right",
}: TutorialTooltipProps) {
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if this tooltip was previously dismissed
    const dismissedTooltips = JSON.parse(
      localStorage.getItem("dismissed_tooltips") || "[]",
    );
    setDismissed(dismissedTooltips.includes(id));
  }, [id]);

  function handleDismiss() {
    const dismissedTooltips = JSON.parse(
      localStorage.getItem("dismissed_tooltips") || "[]",
    );
    dismissedTooltips.push(id);
    localStorage.setItem(
      "dismissed_tooltips",
      JSON.stringify(dismissedTooltips),
    );
    setDismissed(true);
    setOpen(false);
  }

  if (dismissed) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <div className="relative inline-block">
            {children}
            <button
              type="button"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-pulse hover:animate-none"
              onClick={() => setOpen(true)}
            >
              <HelpCircle className="h-3 w-3" />
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <div className="space-y-2">
            <p className="text-sm">{content}</p>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={handleDismiss}
            >
              <X className="h-3 w-3 mr-1" />
              Got it
            </Button>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Hook to reset all dismissed tooltips (useful for testing or user preference)
export function useResetTutorials() {
  return function resetTutorials() {
    localStorage.removeItem("dismissed_tooltips");
    window.location.reload();
  };
}

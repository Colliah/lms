"use client";

import { Award, Sparkles, Star, Trophy, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
}

interface AchievementUnlockProps {
  achievement: Achievement;
  onClose: () => void;
}

const iconMap: Record<string, typeof Trophy> = {
  VOCABULARY: Award,
  GRAMMAR: Star,
  READING: Sparkles,
  STREAK: Trophy,
  GENERAL: Trophy,
};

export function AchievementUnlock({
  achievement,
  onClose,
}: AchievementUnlockProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  function handleClose() {
    setIsExiting(true);
    setTimeout(onClose, 300);
  }

  const Icon = iconMap[achievement.type] || Trophy;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 border-0 cursor-default ${
          isVisible && !isExiting ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
        aria-label="Close achievement"
      />

      {/* Card */}
      <div
        className={`relative transform transition-all duration-500 ease-out ${
          isVisible && !isExiting
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-75 opacity-0 translate-y-8"
        }`}
      >
        {/* Confetti Effect */}
        <div className="absolute -inset-8 overflow-hidden pointer-events-none">
          {[
            "c1",
            "c2",
            "c3",
            "c4",
            "c5",
            "c6",
            "c7",
            "c8",
            "c9",
            "c10",
            "c11",
            "c12",
            "c13",
            "c14",
            "c15",
            "c16",
            "c17",
            "c18",
            "c19",
            "c20",
          ].map((id, i) => (
            <div
              key={id}
              className="absolute animate-confetti"
              style={{
                left: `${(i * 5) % 100}%`,
                animationDelay: `${i * 0.025}s`,
                backgroundColor: [
                  "#FFD700",
                  "#FF6B6B",
                  "#4ECDC4",
                  "#45B7D1",
                  "#96CEB4",
                ][i % 5],
                width: `${6 + (i % 6)}px`,
                height: `${6 + (i % 6)}px`,
                borderRadius: i % 2 === 0 ? "50%" : "2px",
              }}
            />
          ))}
        </div>

        <div className="relative bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 p-1 rounded-2xl shadow-2xl">
          <div className="bg-background rounded-xl p-8 text-center space-y-4 min-w-[300px]">
            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon with glow effect */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-yellow-400/30 blur-xl rounded-full animate-pulse" />
              <div className="relative bg-gradient-to-br from-yellow-400 to-amber-600 p-4 rounded-full">
                <Icon className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Achievement Unlocked!
              </p>
              <h2 className="text-2xl font-bold">{achievement.name}</h2>
            </div>

            {/* Description */}
            <p className="text-muted-foreground">{achievement.description}</p>

            {/* Stars decoration */}
            <div className="flex justify-center gap-1">
              {[1, 2, 3].map((i) => (
                <Star
                  key={i}
                  className="h-5 w-5 text-yellow-500 fill-yellow-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>

            {/* Button */}
            <Button onClick={handleClose} className="w-full mt-4">
              Awesome!
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(400%) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Hook to manage achievement notifications
export function useAchievementNotifications() {
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [current, setCurrent] = useState<Achievement | null>(null);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((prev) => prev.slice(1));
    }
  }, [queue, current]);

  function showAchievement(achievement: Achievement) {
    setQueue((prev) => [...prev, achievement]);
  }

  function dismissCurrent() {
    setCurrent(null);
  }

  return { current, showAchievement, dismissCurrent };
}

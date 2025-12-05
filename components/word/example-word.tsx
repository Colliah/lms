"use client";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

export const ExampleItem = ({
  data,
}: {
  data: { sentence: string; translation: string };
}) => {
  const [isShow, setIsShow] = useState(false);

  return (
    <div className="bg-muted/40 p-4 rounded-lg border-l-4 border-yellow-400 dark:border-yellow-600 transition">
      <div className="flex items-center justify-between gap-4">
        <p className="text-base font-medium text-foreground flex-1">
          {data.sentence}
        </p>

        <Button
          className="text-xs text-muted-foreground/70 hover:text-primary shrink-0 h-8 px-3"
          onClick={() => setIsShow(!isShow)}
          variant="ghost"
          size="sm"
        >
          {isShow ? (
            <div className="flex items-center gap-2 cursor-pointer">
              <EyeOff className="w-4 h-4" />
              <span className="hidden sm:inline">Hide</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">See Translation</span>
            </div>
          )}
        </Button>
      </div>

      {isShow && (
        <p className="text-sm text-muted-foreground italic border-dashed border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-1 duration-200">
          {data.translation}
        </p>
      )}
    </div>
  );
};

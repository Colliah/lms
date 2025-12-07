import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getPosColor } from "@/lib";
import type { ThesaurusEntry } from "@/lib/merriam-webster";

interface ThesaurusDisplayProps {
  entry: ThesaurusEntry;
  onWordClick: (word: string) => void;
}

export function ThesaurusDisplay({
  entry,
  onWordClick,
}: ThesaurusDisplayProps) {
  const WordList = ({
    title,
    words,
    variant,
  }: {
    title: string;
    words: string[];
    variant: any;
  }) => (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm uppercase text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {words.slice(0, 20).map((w) => (
          <Badge
            key={w}
            variant={variant}
            className="cursor-pointer"
            onClick={() => onWordClick(w)}
          >
            {w}
          </Badge>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle className="text-2xl uppercase">{entry.word}</CardTitle>
          {entry.partOfSpeech && (
            <Badge className={`${getPosColor(entry.partOfSpeech)}`}>
              {entry.partOfSpeech}
            </Badge>
          )}
        </div>

        {entry.definition && (
          <CardDescription className="space-y-3">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground">
              Definitions
            </h3>
            <div className="bg-muted/40 rounded-lg border-l-4 border-yellow-400 dark:border-yellow-600 p-4 text-base">
              {entry.definition}
            </div>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {entry.synonyms.length > 0 && (
          <WordList title="Synonyms" words={entry.synonyms} variant="success" />
        )}
        {entry.antonyms.length > 0 && (
          <WordList
            title="Antonyms"
            words={entry.antonyms}
            variant="destructive"
          />
        )}
        {entry.relatedWords.length > 0 && (
          <WordList
            title="Related Words"
            words={entry.relatedWords}
            variant="blue"
          />
        )}
        {entry.nearAntonyms.length > 0 && (
          <WordList
            title="Near Antonyms"
            words={entry.nearAntonyms}
            variant="destructive"
          />
        )}
      </CardContent>
    </Card>
  );
}

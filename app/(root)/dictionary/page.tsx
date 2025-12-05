"use client";

import { Book, BookOpen, Loader2, Search, Volume2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  getDictionaryDefinitionAction,
  getThesaurusDataAction,
} from "@/actions/ai";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DictionaryEntry, ThesaurusEntry } from "@/lib/merriam-webster";

export default function DictionaryPage() {
  const [searchWord, setSearchWord] = useState("");
  const [activeTab, setActiveTab] = useState("dictionary");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const [dictionaryEntry, setDictionaryEntry] =
    useState<DictionaryEntry | null>(null);
  const [thesaurusEntry, setThesaurusEntry] = useState<ThesaurusEntry | null>(
    null,
  );

  async function handleSearch() {
    if (!searchWord.trim()) {
      toast.error("Please enter a word to search");
      return;
    }

    setIsLoading(true);
    setDictionaryEntry(null);
    setThesaurusEntry(null);

    try {
      if (activeTab === "dictionary") {
        const result = await getDictionaryDefinitionAction(searchWord.trim());
        if (result.success && result.data) {
          setDictionaryEntry(result.data);
        } else if (result.success && !result.data) {
          toast.info(`"${searchWord}" not found in dictionary`);
        } else {
          toast.error(result.error || "Failed to fetch definition");
        }
      } else {
        const result = await getThesaurusDataAction(searchWord.trim());
        if (result.success && result.data) {
          setThesaurusEntry(result.data);
        } else if (result.success && !result.data) {
          toast.info(`"${searchWord}" not found in thesaurus`);
        } else {
          toast.error(result.error || "Failed to fetch thesaurus data");
        }
      }
    } catch {
      toast.error("An error occurred while searching");
    } finally {
      setIsLoading(false);
    }
  }

  async function playPronunciation(audioUrl: string) {
    if (isPlayingAudio) return;

    setIsPlayingAudio(true);
    try {
      const audio = new Audio(audioUrl);
      await audio.play();
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setIsPlayingAudio(false);
        toast.error("Failed to play audio");
      };
    } catch {
      setIsPlayingAudio(false);
      toast.error("Failed to play audio");
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  function handleTabChange(value: string) {
    setActiveTab(value);
    setDictionaryEntry(null);
    setThesaurusEntry(null);
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dictionary</h1>
        <p className="text-muted-foreground">
          Look up words using Merriam-Webster Dictionary and Thesaurus
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dictionary" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Dictionary
          </TabsTrigger>
          <TabsTrigger value="thesaurus" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Thesaurus
          </TabsTrigger>
        </TabsList>

        {/* Search Input */}
        <div className="flex gap-2 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={
                activeTab === "dictionary"
                  ? "Enter a word to look up..."
                  : "Enter a word to find synonyms..."
              }
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>

        {/* Dictionary Tab Content */}
        <TabsContent value="dictionary" className="mt-6">
          {dictionaryEntry ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl">
                      {dictionaryEntry.word}
                    </CardTitle>
                    {dictionaryEntry.partOfSpeech && (
                      <Badge variant="secondary">
                        {dictionaryEntry.partOfSpeech}
                      </Badge>
                    )}
                  </div>
                  {dictionaryEntry.pronunciations.length > 0 &&
                    dictionaryEntry.pronunciations[0].audioUrl && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          const audioUrl =
                            dictionaryEntry.pronunciations[0].audioUrl;
                          if (audioUrl) {
                            playPronunciation(audioUrl);
                          }
                        }}
                        disabled={isPlayingAudio}
                      >
                        <Volume2
                          className={`h-4 w-4 ${isPlayingAudio ? "animate-pulse" : ""}`}
                        />
                      </Button>
                    )}
                </div>
                {dictionaryEntry.pronunciations.length > 0 && (
                  <CardDescription className="text-lg">
                    /{dictionaryEntry.pronunciations[0].notation}/
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Definitions */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                    Definitions
                  </h3>
                  <ol className="list-decimal list-inside space-y-2">
                    {dictionaryEntry.shortDefinitions.map((def) => (
                      <li key={def} className="text-base">
                        {def}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Examples */}
                {dictionaryEntry.examples.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                      Examples
                    </h3>
                    <div className="space-y-2 pl-4 border-l-2 border-muted">
                      {dictionaryEntry.examples.slice(0, 5).map((example) => (
                        <p
                          key={example}
                          className="text-muted-foreground italic"
                        >
                          "{example}"
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Etymology */}
                {dictionaryEntry.etymology && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                      Etymology
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {dictionaryEntry.etymology}
                    </p>
                  </div>
                )}

                {/* First Known Use */}
                {dictionaryEntry.firstKnownUse && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">First Known Use:</span>{" "}
                      {dictionaryEntry.firstKnownUse}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Enter a word above to look up its definition
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Thesaurus Tab Content */}
        <TabsContent value="thesaurus" className="mt-6">
          {thesaurusEntry ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">
                    {thesaurusEntry.word}
                  </CardTitle>
                  {thesaurusEntry.partOfSpeech && (
                    <Badge variant="secondary">
                      {thesaurusEntry.partOfSpeech}
                    </Badge>
                  )}
                </div>
                {thesaurusEntry.definition && (
                  <CardDescription className="text-base italic">
                    {thesaurusEntry.definition}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Synonyms */}
                {thesaurusEntry.synonyms.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                      Synonyms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {thesaurusEntry.synonyms.map((syn) => (
                        <Badge
                          key={syn}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() => {
                            setSearchWord(syn);
                            handleSearch();
                          }}
                        >
                          {syn}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Antonyms */}
                {thesaurusEntry.antonyms.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                      Antonyms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {thesaurusEntry.antonyms.map((ant) => (
                        <Badge
                          key={ant}
                          variant="outline"
                          className="border-red-200 text-red-700 dark:border-red-800 dark:text-red-300 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => {
                            setSearchWord(ant);
                            handleSearch();
                          }}
                        >
                          {ant}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Words */}
                {thesaurusEntry.relatedWords.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                      Related Words
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {thesaurusEntry.relatedWords.slice(0, 15).map((rel) => (
                        <Badge
                          key={rel}
                          variant="outline"
                          className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950"
                          onClick={() => {
                            setSearchWord(rel);
                            handleSearch();
                          }}
                        >
                          {rel}
                        </Badge>
                      ))}
                      {thesaurusEntry.relatedWords.length > 15 && (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          +{thesaurusEntry.relatedWords.length - 15} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Near Antonyms */}
                {thesaurusEntry.nearAntonyms.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                      Near Antonyms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {thesaurusEntry.nearAntonyms.slice(0, 10).map((near) => (
                        <Badge
                          key={near}
                          variant="outline"
                          className="border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950"
                          onClick={() => {
                            setSearchWord(near);
                            handleSearch();
                          }}
                        >
                          {near}
                        </Badge>
                      ))}
                      {thesaurusEntry.nearAntonyms.length > 10 && (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          +{thesaurusEntry.nearAntonyms.length - 10} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Book className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Enter a word above to find synonyms and antonyms
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Attribution */}
      <p className="text-xs text-muted-foreground text-center">
        Powered by Merriam-Webster Dictionary and Thesaurus API
      </p>
    </div>
  );
}

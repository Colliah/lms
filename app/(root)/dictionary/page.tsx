"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Book, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getDictionaryDefinitionAction,
  getThesaurusDataAction,
} from "@/actions/ai";
import type { DictionaryEntry, ThesaurusEntry } from "@/lib/merriam-webster";
import { SearchBar } from "@/components/dictionary/search-bar";
import { DictionaryDisplay } from "@/components/dictionary/dictionary-display";
import { EmptyState } from "@/components/dictionary/empty-state";
import { ThesaurusDisplay } from "@/components/dictionary/thesaurus-display";

export default function DictionaryPage() {
  const [searchWord, setSearchWord] = useState("");
  const [activeTab, setActiveTab] = useState("dictionary");
  const [isLoading, setIsLoading] = useState(false);
  const [dictionaryEntry, setDictionaryEntry] =
    useState<DictionaryEntry | null>(null);
  const [thesaurusEntry, setThesaurusEntry] = useState<ThesaurusEntry | null>(
    null
  );

  console.log(thesaurusEntry);

  async function handleSearch(term: string = searchWord) {
    if (!term.trim()) {
      toast.error("Please enter a word to search");
      return;
    }
    if (term !== searchWord) setSearchWord(term);

    setIsLoading(true);
    setDictionaryEntry(null);
    setThesaurusEntry(null);

    try {
      if (activeTab === "dictionary") {
        const result = await getDictionaryDefinitionAction(term.trim());
        if (result.success && result.data) setDictionaryEntry(result.data);
        else toast.info("Not found");
      } else {
        const result = await getThesaurusDataAction(term.trim());
        if (result.success && result.data) setThesaurusEntry(result.data);
        else toast.info("Not found");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
        Merriam-Webster's Dictionary
      </h1>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v);
          setDictionaryEntry(null);
          setThesaurusEntry(null);
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dictionary" className="flex gap-2">
            <BookOpen className="h-4 w-4" /> Dictionary
          </TabsTrigger>
          <TabsTrigger value="thesaurus" className="flex gap-2">
            <Book className="h-4 w-4" /> Thesaurus
          </TabsTrigger>
        </TabsList>

        <SearchBar
          value={searchWord}
          onChange={setSearchWord}
          onSearch={() => handleSearch()}
          isLoading={isLoading}
          placeholder={
            activeTab === "dictionary" ? "Enter a word..." : "Find synonyms..."
          }
        />

        <TabsContent value="dictionary" className="mt-6">
          {dictionaryEntry ? (
            <DictionaryDisplay entry={dictionaryEntry} />
          ) : (
            <EmptyState
              icon={BookOpen}
              message="Enter a word above to look up its definition"
            />
          )}
        </TabsContent>

        <TabsContent value="thesaurus" className="mt-6">
          {thesaurusEntry ? (
            <ThesaurusDisplay
              entry={thesaurusEntry}
              onWordClick={(word) => handleSearch(word)}
            />
          ) : (
            <EmptyState
              icon={Book}
              message="Enter a word above to find synonyms"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

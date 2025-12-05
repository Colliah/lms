import { notFound } from "next/navigation";
import { fetchPassageByIdAction } from "@/actions/reading";
import ReadingPassageInterface from "@/components/reading/reading-passage-interface";

interface ReadingPassagePageProps {
  params: Promise<{ id: string }>;
}

export default async function ReadingPassagePage({
  params,
}: ReadingPassagePageProps) {
  const { id } = await params;

  const result = await fetchPassageByIdAction(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <ReadingPassageInterface passage={result.data} />
    </div>
  );
}

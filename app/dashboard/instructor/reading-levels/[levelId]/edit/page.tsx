import { LevelBuilderClient } from "./LevelBuilderClient";

interface PageProps {
  params: Promise<{ levelId: string }>;
}

export default async function LevelBuilderPage({ params }: PageProps) {
  const { levelId } = await params;
  return (
    <div className="space-y-8">
      <LevelBuilderClient levelId={levelId} />
    </div>
  );
}

import { Activity, Code2, FolderGit2, Layers3 } from "lucide-react";

import type { Repository } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OverviewDashboardProps = {
  repositories: Repository[];
};

export function OverviewDashboard({ repositories }: OverviewDashboardProps) {
  const readyCount = repositories.filter(
    (repository) => repository.indexStatus === "READY"
  ).length;
  const indexingCount = repositories.filter(
    (repository) => repository.indexStatus === "INDEXING"
  ).length;
  const chunkCount = repositories.reduce(
    (total, repository) => total + repository.chunkCount,
    0
  );
  const languageCount = new Set(
    repositories
      .map((repository) => repository.language)
      .filter((language): language is string => Boolean(language))
  ).size;

  const stats = [
    { label: "Repositories", value: repositories.length, Icon: FolderGit2 },
    { label: "Indexed", value: readyCount, Icon: Activity },
    { label: "Code chunks", value: chunkCount, Icon: Layers3 },
    { label: "Languages", value: languageCount, Icon: Code2 },
  ];

  return (
    <section className="space-y-6" aria-label="Workspace overview">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Workspace overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A snapshot of your connected codebases and indexing activity.
        </p>
      </div>

      {indexingCount > 0 && (
        <p className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          {indexingCount}{" "}
          {indexingCount === 1 ? "repository is" : "repositories are"} currently
          indexing.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, Icon }) => (
          <Card key={label} className="rounded-3xl shadow-sm">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <span className="rounded-xl bg-primary/10 p-2 text-primary">
                <Icon aria-hidden="true" className="size-4" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">
                {value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

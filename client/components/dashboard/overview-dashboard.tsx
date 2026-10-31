import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  FolderGit2,
  GitBranch,
  Layers3,
  Loader2,
  MessageSquare,
  Sparkles,
  XCircle,
} from "lucide-react";

import type { Repository } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type OverviewDashboardProps = {
  repositories: Repository[];
};

export function OverviewDashboard({ repositories }: OverviewDashboardProps) {
  const readyRepos = repositories.filter(
    (repository) => repository.indexStatus === "READY"
  );
  const indexingRepos = repositories.filter(
    (repository) => repository.indexStatus === "INDEXING"
  );
  const failedRepos = repositories.filter(
    (repository) => repository.indexStatus === "FAILED"
  );
  const pendingRepos = repositories.filter(
    (repository) => repository.indexStatus === "PENDING"
  );

  const readyCount = readyRepos.length;
  const indexingCount = indexingRepos.length;
  const totalChunks = repositories.reduce(
    (total, repository) => total + (repository.chunkCount || 0),
    0
  );
  const languageCount = new Set(
    repositories
      .map((repository) => repository.language)
      .filter((language): language is string => Boolean(language))
  ).size;

  const stats = [
    {
      label: "Total Repositories",
      value: repositories.length,
      description: "Connected GitHub codebases",
      Icon: FolderGit2,
    },
    {
      label: "Ready for Chat",
      value: readyCount,
      description: "Fully embedded & searchable",
      Icon: Activity,
    },
    {
      label: "Indexed Code Chunks",
      value: totalChunks,
      description: "Stored in pgvector store",
      Icon: Layers3,
    },
    {
      label: "Languages Detected",
      value: languageCount,
      description: "Across your workspace",
      Icon: Code2,
    },
  ];

  const indexedPercent =
    repositories.length > 0
      ? Math.round((readyCount / repositories.length) * 100)
      : 0;

  return (
    <div className="space-y-8" aria-label="Workspace overview">
      {/* Top Banner if indexing active */}
      {indexingCount > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
          <div className="flex items-center gap-3">
            <Loader2 className="size-5 animate-spin shrink-0" />
            <div>
              <p className="font-medium">
                {indexingCount}{" "}
                {indexingCount === 1 ? "repository is" : "repositories are"}{" "}
                currently indexing
              </p>
              <p className="text-xs text-muted-foreground">
                Code is being chunked and embedded with Google Gemini.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1 border-primary/30 text-primary hover:bg-primary/10"
            )}
          >
            View Progress
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, description, Icon }) => (
          <Card key={label} className="rounded-3xl shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Icon aria-hidden="true" className="size-4" />
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {value.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Section: Ready Repositories & System Stack */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ready for Chat Repositories (2 cols) */}
        <Card className="rounded-3xl shadow-sm lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Ready for AI Chat
              </CardTitle>
              <CardDescription>
                Repositories with indexed vector embeddings ready for questions.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              {readyCount} Ready
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {readyRepos.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center">
                <FolderGit2 className="size-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium">No repositories indexed yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Go to Repositories and click Index to enable AI chat on any codebase.
                </p>
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ variant: "default", size: "sm" }), "mt-4 gap-1.5")}
                >
                  <FolderGit2 className="size-3.5" />
                  Go to Repositories
                </Link>
              </div>
            ) : (
              <div className="divide-y rounded-2xl border">
                {readyRepos.slice(0, 5).map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-sm">
                          {repo.fullName}
                        </p>
                        {repo.isPrivate && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                            Private
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <GitBranch className="size-3" />
                          {repo.defaultBranch}
                        </span>
                        <span>•</span>
                        <span>{(repo.chunkCount || 0).toLocaleString()} chunks</span>
                        {repo.language && (
                          <>
                            <span>•</span>
                            <span>{repo.language}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/chat/${repo.id}`}
                      className={cn(
                        buttonVariants({ variant: "default", size: "sm" }),
                        "shrink-0 gap-1.5 rounded-xl h-8 px-3 text-xs"
                      )}
                    >
                      <MessageSquare className="size-3.5" />
                      Chat
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {readyRepos.length > 5 && (
              <div className="text-center pt-2">
                <Link
                  href="/dashboard"
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  View all {readyRepos.length} ready repositories
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Indexing Status & AI Architecture Card (1 col) */}
        <div className="space-y-6">
          {/* Indexing Progress Summary */}
          <Card className="rounded-3xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Coverage Summary
              </CardTitle>
              <CardDescription>
                Proportion of repositories indexed for search.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span>Workspace Coverage</span>
                  <span>{indexedPercent}%</span>
                </div>
                <Progress value={indexedPercent} className="h-2" />
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    Indexed & Ready
                  </span>
                  <span className="font-semibold">{readyCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Loader2 className="size-3.5 text-primary" />
                    Currently Indexing
                  </span>
                  <span className="font-semibold">{indexingCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <XCircle className="size-3.5 text-destructive" />
                    Failed
                  </span>
                  <span className="font-semibold">{failedRepos.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <FolderGit2 className="size-3.5 text-muted-foreground" />
                    Not Indexed
                  </span>
                  <span className="font-semibold">{pendingRepos.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Architecture Overview */}
          <Card className="rounded-3xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                AI Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Cpu className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Google Gemini 3.5 Flash</p>
                  <p className="text-muted-foreground">Chat reasoning & RAG synthesis</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Database className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">PostgreSQL + pgvector</p>
                  <p className="text-muted-foreground">768-dim HNSW cosine similarity search</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

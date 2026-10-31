import Link from "next/link";
import {
  Check,
  ExternalLink,
  GitBranch,
  Globe2,
  LockKeyhole,
  Loader2,
  MessageSquare,
  Play,
  RotateCw,
} from "lucide-react";
import { cn } from "cn";

import type { Repository } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { IndexErrorAlert } from "./index-error-alert";
import { RepoStatus } from "./repo-status";

type RepoCardProps = {
  repository: Repository;
  onStartIndexing?: (repositoryId: string) => void;
  isStartingIndexing?: boolean;
};

export function RepoCard({
  repository,
  onStartIndexing,
  isStartingIndexing = false,
}: RepoCardProps) {
  const languageStyle = getLanguageStyle(repository.language);
  const statusLabel = {
    PENDING: "Not indexed",
    INDEXING: "Indexing",
    READY: "Ready",
    FAILED: "Failed",
  }[repository.indexStatus];

  const canNavigateToChat =
    repository.indexStatus === "READY" || repository.indexStatus === "INDEXING";

  return (
    <Card className="h-full gap-0 rounded-2xl border-border/70 bg-card py-0 shadow-none transition-colors hover:border-border hover:bg-muted/10">
      <CardHeader className="gap-3 px-4 pt-4 pb-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${languageStyle}`}
            aria-hidden="true"
          >
            <span className="text-[10px] font-bold">
              {getLanguageMark(repository.language)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">
              {repository.owner}
            </p>
            <CardTitle className="truncate text-sm font-semibold">
              {canNavigateToChat ? (
                <Link
                  href={`/chat/${repository.id}`}
                  className="transition-colors hover:text-primary hover:underline"
                >
                  {repository.name}
                </Link>
              ) : (
                repository.name
              )}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 ${
              repository.indexStatus === "READY"
                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : repository.indexStatus === "FAILED"
                  ? "border-destructive/30 text-destructive"
                  : repository.indexStatus === "INDEXING"
                    ? "border-primary/30 text-primary"
                    : "text-muted-foreground"
            }`}
          >
            {repository.indexStatus === "READY" && (
              <Check aria-hidden="true" />
            )}
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col px-4 pb-0">
        <div className="min-h-14 border-t border-border/60 py-3">
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {repository.description || "No description provided."}
          </p>
        </div>

        <div className="flex min-h-10 flex-wrap items-center gap-1.5 py-2">
          {repository.isPrivate ? (
            <Badge variant="secondary" className="h-6 gap-1 rounded-full px-2 text-[11px]">
              <LockKeyhole aria-hidden="true" />
              Private
            </Badge>
          ) : (
            <Badge variant="secondary" className="h-6 gap-1 rounded-full px-2 text-[11px]">
              <Globe2 aria-hidden="true" />
              Public
            </Badge>
          )}
          <Badge variant="secondary" className="h-6 max-w-32 gap-1 rounded-full px-2 text-[11px]">
            <GitBranch aria-hidden="true" />
            <span className="truncate">{repository.defaultBranch || "main"}</span>
          </Badge>
          {repository.language && (
            <Badge
              variant="secondary"
              className="h-6 gap-1 rounded-full px-2 text-[11px]"
            >
              <span
                className={`flex size-4 items-center justify-center rounded-full text-[8px] font-bold ${languageStyle}`}
                aria-hidden="true"
              >
                {getLanguageMark(repository.language)}
              </span>
              {repository.language}
            </Badge>
          )}
          {repository.indexStatus === "READY" && (
            <span className="text-[11px] text-muted-foreground">
              {repository.chunkCount.toLocaleString()}{" "}
              {repository.chunkCount === 1 ? "chunk" : "chunks"}
            </span>
          )}
        </div>

        {repository.indexStatus === "INDEXING" && (
          <div className="py-2">
            <RepoStatus
              status={repository.indexStatus}
              filesProcessed={repository.filesProcessed}
              filesTotal={repository.filesTotal}
              chunkCount={repository.chunkCount}
            />
          </div>
        )}

        {repository.indexStatus === "FAILED" && repository.errorMessage && (
          <IndexErrorAlert
            message={repository.errorMessage}
            onRetry={
              onStartIndexing
                ? () => onStartIndexing(repository.id)
                : undefined
            }
            isRetrying={isStartingIndexing}
          />
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 py-3">
          <a
            href={repository.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-w-0 items-center gap-1.5 truncate text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`View ${repository.fullName} on GitHub`}
          >
            <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
            {repository.fullName}
          </a>

          <div className="flex items-center gap-1.5">
            {repository.indexStatus === "READY" && (
              <>
                {onStartIndexing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onStartIndexing(repository.id)}
                    disabled={isStartingIndexing}
                    className="h-7 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground"
                    title="Re-index repository"
                  >
                    <RotateCw className="size-3" aria-hidden="true" />
                    <span className="sr-only sm:inline ml-1 text-[11px]">Reindex</span>
                  </Button>
                )}
                <Link
                  href={`/chat/${repository.id}`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "h-7 rounded-lg bg-primary px-3 text-xs gap-1.5 font-medium shadow-sm"
                  )}
                >
                  <MessageSquare className="size-3.5" aria-hidden="true" />
                  Chat
                </Link>
              </>
            )}

            {repository.indexStatus === "INDEXING" && (
              <Link
                href={`/chat/${repository.id}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-7 rounded-lg border-primary/40 px-2.5 text-xs text-primary hover:bg-primary/10 gap-1.5"
                )}
              >
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                View Progress
              </Link>
            )}

            {(repository.indexStatus === "PENDING" || repository.indexStatus === "FAILED") && onStartIndexing && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => onStartIndexing(repository.id)}
                disabled={isStartingIndexing}
                className="h-7 rounded-lg bg-primary px-2.5 text-xs gap-1.5"
              >
                {repository.indexStatus === "FAILED" ? (
                  <RotateCw className="size-3.5" aria-hidden="true" />
                ) : (
                  <Play className="size-3.5" aria-hidden="true" />
                )}
                {repository.indexStatus === "FAILED" ? "Retry" : "Index"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getLanguageMark(language: string | null) {
  if (!language) return "</>";

  const marks: Record<string, string> = {
    javascript: "JS",
    typescript: "TS",
    python: "Py",
    java: "J",
    go: "Go",
    rust: "Rs",
    ruby: "Rb",
    html: "H",
    css: "#",
    shell: "$",
  };

  return marks[language.toLowerCase()] ?? language.slice(0, 2);
}

function getLanguageStyle(language: string | null) {
  const styles: Record<string, string> = {
    javascript: "bg-yellow-300 text-yellow-950 dark:bg-yellow-400",
    typescript: "bg-sky-500 text-white",
    python: "bg-blue-500 text-white",
    java: "bg-orange-500 text-white",
    go: "bg-cyan-500 text-slate-950",
    rust: "bg-orange-700 text-white",
    ruby: "bg-rose-600 text-white",
    html: "bg-orange-500 text-white",
    css: "bg-indigo-500 text-white",
    shell: "bg-emerald-600 text-white",
  };

  return language
    ? styles[language.toLowerCase()] ?? "bg-muted-foreground/70 text-white"
    : "bg-muted-foreground/70 text-white";
}

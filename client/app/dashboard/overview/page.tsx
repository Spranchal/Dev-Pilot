"use client";

import Link from "next/link";
import { FolderGit2, Loader2, RotateCw } from "lucide-react";

import { RequireAuth } from "@/components/providers/require-auth";
import { AppShell } from "@/components/layout/app-shell";
import { OverviewDashboard } from "@/components/dashboard/overview-dashboard";
import { useRepos, useRefreshRepos } from "@/hooks/use-repos";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function OverviewPage() {
  return (
    <RequireAuth>
      <OverviewContent />
    </RequireAuth>
  );
}

function OverviewContent() {
  const reposQuery = useRepos();
  const refreshRepos = useRefreshRepos();
  const repositories = reposQuery.data ?? [];

  return (
    <AppShell
      title="Overview"
      description="System metrics, connected repositories, and indexing status."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshRepos.mutate()}
            disabled={refreshRepos.isPending}
            className="gap-1.5"
          >
            <RotateCw
              className={cn(
                "size-3.5",
                refreshRepos.isPending && "animate-spin"
              )}
            />
            Sync GitHub
          </Button>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "gap-1.5"
            )}
          >
            <FolderGit2 className="size-3.5" />
            Repositories
          </Link>
        </div>
      }
    >
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        {reposQuery.isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <OverviewDashboard repositories={repositories} />
        )}
      </main>
    </AppShell>
  );
}


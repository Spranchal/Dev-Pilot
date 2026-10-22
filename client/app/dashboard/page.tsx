"use client";

import { useState } from "react";

import { RequireAuth } from "@/components/providers/require-auth";
import { AppShell } from "@/components/layout/app-shell";
import {
  DashboardHeader,
  RepoDashboard,
} from "@/components/dashboard";
import { useRepos, useRefreshRepos, useStartIndexing } from "@/hooks/use-repos";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}

function DashboardContent() {
  const [search, setSearch] = useState("");
  const reposQuery = useRepos();
  const refreshRepos = useRefreshRepos();
  const startIndexing = useStartIndexing();
  const repositories = reposQuery.data ?? [];
  const readyCount = repositories.filter(
    (repository) => repository.indexStatus === "READY"
  ).length;

  return (
    <AppShell hideHeader>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <DashboardHeader
          repositoryCount={repositories.length}
          readyCount={readyCount}
          search={search}
          onSearchChange={setSearch}
          onRefresh={() => refreshRepos.mutate()}
          isRefreshing={refreshRepos.isPending}
        />
        <RepoDashboard
          repositories={repositories}
          search={search}
          isLoading={reposQuery.isPending}
          error={reposQuery.error}
          onStartIndexing={(repositoryId) =>
            startIndexing.mutate(repositoryId)
          }
          indexingRepositoryId={
            startIndexing.isPending ? startIndexing.variables : undefined
          }
        />
      </main>
    </AppShell>
  );
}
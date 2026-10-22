"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import type { Repository } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

import { RepoCard } from "./repo-card";

type VisibilityFilter = "ALL" | "PUBLIC" | "PRIVATE";
type StatusFilter = "ALL" | "READY" | "INDEXING" | "NEW" | "FAILED";

type RepoDashboardProps = {
  repositories: Repository[];
  search: string;
  isLoading?: boolean;
  error?: Error | null;
  onStartIndexing?: (repositoryId: string) => void;
  indexingRepositoryId?: string;
};

export function RepoDashboard({
  repositories,
  search,
  isLoading = false,
  error,
  onStartIndexing,
  indexingRepositoryId,
}: RepoDashboardProps) {
  const [visibility, setVisibility] = useState<VisibilityFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const filteredRepositories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return repositories.filter((repository) => {
      const matchesSearch =
      !query ||
      [
        repository.fullName,
        repository.description ?? "",
        repository.language ?? "",
      ].some((value) => value.toLocaleLowerCase().includes(query));
      const matchesVisibility =
      visibility === "ALL" ||
      (visibility === "PRIVATE" && repository.isPrivate) ||
      (visibility === "PUBLIC" && !repository.isPrivate);
      const matchesStatus =
      status === "ALL" ||
      (status === "READY" && repository.indexStatus === "READY") ||
      (status === "INDEXING" && repository.indexStatus === "INDEXING") ||
      (status === "NEW" && repository.indexStatus === "PENDING") ||
      (status === "FAILED" && repository.indexStatus === "FAILED");

      return matchesSearch && matchesVisibility && matchesStatus;
    });
  }, [repositories, search, status, visibility]);

  const visibilityFilters: { value: VisibilityFilter; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "PUBLIC", label: "Public" },
    { value: "PRIVATE", label: "Private" },
  ];
  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "READY", label: "Ready" },
    { value: "INDEXING", label: "Indexing" },
    { value: "NEW", label: "New" },
    { value: "FAILED", label: "Failed" },
  ];

  const countForStatus = (filter: StatusFilter) =>
    repositories.filter((repository) => {
      if (filter === "ALL") return true;
      if (filter === "NEW") return repository.indexStatus === "PENDING";
      return repository.indexStatus === filter;
    }).length;

  const countForVisibility = (filter: VisibilityFilter) =>
    repositories.filter((repository) => {
      if (filter === "ALL") return true;
      return filter === "PRIVATE" ? repository.isPrivate : !repository.isPrivate;
    }).length;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-64 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load repositories</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (repositories.length === 0) {
    return (
      <Empty className="min-h-72 rounded-3xl border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Search aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>No repositories yet</EmptyTitle>
          <EmptyDescription>
            Sync your GitHub repositories to start indexing and chatting with
            your codebase.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <section className="space-y-4" aria-label="Repositories">
      <div className="flex flex-col gap-3 border-b pb-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterRow
          label="Visibility"
          filters={visibilityFilters}
          selected={visibility}
          count={countForVisibility}
          onChange={setVisibility}
        />
        <FilterRow
          label="Status"
          filters={statusFilters}
          selected={status}
          count={countForStatus}
          onChange={setStatus}
        />
      </div>

      {filteredRepositories.length > 0 ? (
        <div className="grid items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRepositories.map((repository) => (
            <RepoCard
              key={repository.id}
              repository={repository}
              onStartIndexing={onStartIndexing}
              isStartingIndexing={indexingRepositoryId === repository.id}
            />
          ))}
        </div>
      ) : (
        <Empty className="min-h-56 rounded-3xl border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No repositories match these filters</EmptyTitle>
            <EmptyDescription>
              Adjust the search or filters to see more repositories.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </section>
  );
}

function FilterRow<T extends string>({
  label,
  filters,
  selected,
  count,
  onChange,
}: {
  label: string;
  filters: { value: T; label: string }[];
  selected: T;
  count: (filter: T) => number;
  onChange: (filter: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {filters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          aria-pressed={selected === filter.value}
          onClick={() => onChange(filter.value)}
          className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs transition-colors ${
            selected === filter.value
              ? "border-foreground/15 bg-foreground text-background"
              : "border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
          }`}
        >
          {filter.label}
          {filter.value !== "ALL" && (
            <span
              className={
                selected === filter.value
                  ? "text-background/70"
                  : "text-muted-foreground/70"
              }
            >
              {count(filter.value)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

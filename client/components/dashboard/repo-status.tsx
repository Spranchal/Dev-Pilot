import {
  CheckCircle2,
  CircleDashed,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";

import type { IndexStatus } from "@/lib/api";
import { Progress } from "@/components/ui/progress";

type RepoStatusProps = {
  status: IndexStatus;
  filesProcessed: number;
  filesTotal: number;
  chunkCount?: number;
};

const statusPresentation: Record<
  IndexStatus,
  { label: string; className: string; Icon: typeof CircleDashed }
> = {
  PENDING: {
    label: "Not indexed",
    className: "text-muted-foreground",
    Icon: CircleDashed,
  },
  INDEXING: {
    label: "Indexing",
    className: "text-primary",
    Icon: LoaderCircle,
  },
  READY: {
    label: "Ready",
    className: "text-emerald-600 dark:text-emerald-400",
    Icon: CheckCircle2,
  },
  FAILED: {
    label: "Index failed",
    className: "text-destructive",
    Icon: TriangleAlert,
  },
};

export function RepoStatus({
  status,
  filesProcessed,
  filesTotal,
  chunkCount,
}: RepoStatusProps) {
  const { label, className, Icon } = statusPresentation[status];
  const progress =
    filesTotal > 0
      ? Math.min(100, Math.round((filesProcessed / filesTotal) * 100))
      : 0;

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center gap-1.5 text-xs font-medium ${className}`}
        aria-live={status === "INDEXING" ? "polite" : undefined}
      >
        <Icon
          aria-hidden="true"
          className={status === "INDEXING" ? "size-3.5 animate-spin" : "size-3.5"}
        />
        <span>{label}</span>
        {status === "READY" && chunkCount !== undefined && (
          <span className="ml-auto text-muted-foreground">
            {chunkCount.toLocaleString()}{" "}
            {chunkCount === 1 ? "chunk" : "chunks"}
          </span>
        )}
      </div>

      {status === "INDEXING" && (
        <div className="space-y-1.5">
          <Progress
            value={progress}
            aria-label={`Indexing progress: ${progress}%`}
            className="gap-0"
          />
          <p className="text-xs text-muted-foreground">
            {filesProcessed.toLocaleString()} of{" "}
            {filesTotal.toLocaleString()} files processed
          </p>
        </div>
      )}
    </div>
  );
}

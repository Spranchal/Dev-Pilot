import { AlertCircle, RotateCw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type IndexErrorAlertProps = {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
};

export function IndexErrorAlert({
  message,
  onRetry,
  isRetrying = false,
}: IndexErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle aria-hidden="true" />
      <AlertTitle>Indexing failed</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
        <span className="min-w-0 break-words">{message}</span>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
          >
            <RotateCw
              aria-hidden="true"
              className={isRetrying ? "animate-spin" : undefined}
            />
            {isRetrying ? "Retrying..." : "Try again"}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

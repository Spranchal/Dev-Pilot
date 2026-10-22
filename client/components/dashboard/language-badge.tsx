import { Code2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function LanguageBadge({ language }: { language: string | null }) {
  if (!language) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Unknown language
      </Badge>
    );
  }

  return (
    <Badge variant="secondary">
      <Code2 aria-hidden="true" />
      {language}
    </Badge>
  );
}

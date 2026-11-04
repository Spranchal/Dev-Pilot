"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/loading-ui/loading-screen";

export function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading, isError } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <LoadingScreen
        message="Loading your workspace..."
        submessage="Verifying credentials and access"
      />
    );
  }

  if (isError || !user) {
    return null;
  }

  return <>{children}</>;
}

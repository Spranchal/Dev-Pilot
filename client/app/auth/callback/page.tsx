"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useCurrentUser } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/loading-ui/loading-screen";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { data: user, isLoading, isError, isFetched } = useCurrentUser();

  useEffect(() => {
    if (!isFetched || isLoading) return;

    if (user) {
      router.replace("/dashboard");
      return;
    }

    router.replace("/login?error=session");
  }, [user, isLoading, isFetched, isError, router]);

  return (
    <LoadingScreen
      message="Finishing GitHub sign-in..."
      submessage="Authenticating session and granting workspace access"
    />
  );
}

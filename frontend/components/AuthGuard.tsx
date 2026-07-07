"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <p role="status" className="mx-auto max-w-6xl px-4 py-10 text-ink-500">
        Wczytywanie…
      </p>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

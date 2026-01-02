"use client";

import { TabNavigation } from "@/features/app-shell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 pb-20">{children}</div>
      <TabNavigation />
    </div>
  );
}


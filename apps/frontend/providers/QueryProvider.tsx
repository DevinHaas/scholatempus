"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { EdenProvider, edenClient } from "@/lib/eden";

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <EdenProvider client={edenClient} queryClient={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        {children}
      </EdenProvider>
    </QueryClientProvider>
  );
};

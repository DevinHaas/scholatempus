import { treaty } from "@elysiajs/eden";
import { createEdenTanStackQuery } from "eden-tanstack-react-query";
import type { App } from "scholatempus-backend";

export const edenClient = treaty<App>(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  {
    async onRequest(_path, options) {
      if (typeof window !== "undefined" && (window as any).Clerk) {
        const token = await (window as any).Clerk.session?.getToken();
        if (token) {
          return { headers: { Authorization: `Bearer ${token}` } };
        }
      }
      return options;
    },
  },
);

export const { EdenProvider, useEden } = createEdenTanStackQuery<App>();

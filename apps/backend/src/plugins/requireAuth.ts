import { Elysia } from "elysia";
import { clerkPlugin } from "elysia-clerk";

export const authPlugin = new Elysia()
  .use(clerkPlugin())
  .resolve(async ({ auth, status }) => {
    const { userId } = auth();

    if (!userId) {
      throw status(401, "Unauthorized");
    }
    return { userId };
  })
  .macro({
    requireAuth(enabled: boolean) {
      if (!enabled) return;
      return {
        beforeHandle({ userId, status }) {
          if (!userId) {
            throw status(401, "Unauthorized");
          }
        },
      };
    },
  })
  .as("global");

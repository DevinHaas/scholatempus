import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { profileModule } from "./modules/profile/index.js";
import { workentriesModule } from "./modules/workentries/index.js";
import { adminModule } from "./modules/admin/index.js";

const app = new Elysia()
  .use(
    cors({
      origin: [
        "http://localhost:3001",
        "http://localhost:3000",
        "https://scholatempus.bleat.ch",
      ],
      credentials: true,
    }),
  )
  .use(
    openapi({
      references: fromTypes(),
    }),
  )
  .use(profileModule)
  .use(workentriesModule)
  .use(adminModule)
  .get("/", () => {
    return "Welcome to the Scholatempus backend!";
  })
  .listen(process.env.PORT ?? 4000);

console.log(
  `Backend running at http://${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;

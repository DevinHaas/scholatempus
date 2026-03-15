import { Elysia } from "elysia";
import { authPlugin } from "../../plugins/requireAuth.js";
import { AppError } from "../../lib/errors.js";
import {
  UpsertProfileBody,
  UpsertProfileResponse,
  CheckProfileExistsResponse,
  GetProfileResponse,
} from "./model.js";
import { ProfileService } from "./service.js";

export const profileModule = new Elysia({ prefix: "/profile" })
  .use(authPlugin)
  .onError(({ error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return { message: error.message };
    }
    set.status = 500;
    return { message: "Internal server error" };
  })
  .get("/exists", ({ userId }) => ProfileService.checkExists(userId!), {
    requireAuth: true,
    response: { 200: CheckProfileExistsResponse },
  })
  .get("/", ({ userId }) => ProfileService.getProfile(userId!), {
    requireAuth: true,
    response: { 200: GetProfileResponse },
  })
  .put(
    "/",
    ({ body, userId }) => {
      return ProfileService.upsertProfile(userId!, body);
    },
    {
      requireAuth: true,
      body: UpsertProfileBody,
      response: { 200: UpsertProfileResponse },
    },
  );

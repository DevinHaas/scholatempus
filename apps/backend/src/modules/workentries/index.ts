import { Elysia, t } from "elysia";
import { authPlugin } from "../../plugins/requireAuth.js";
import { AppError } from "../../lib/errors.js";
import {
  AddWorkEntriesBody,
  AddWorkEntriesResponse,
  UpdateWorkEntryBody,
  UpdateWorkEntryResponse,
  GetWorkEntriesResponse,
  DeleteWorkEntryResponse,
} from "./model.js";
import { WorkEntryService } from "./service.js";

export const workentriesModule = new Elysia({ prefix: "/workentries" })
  .use(authPlugin)
  .onError(({ error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return { message: error.message };
    }
    set.status = 500;
    return { message: "Internal server error" };
  })
  .get("/", ({ userId }) => WorkEntryService.getAll(userId!), {
    requireAuth: true,
    response: { 200: GetWorkEntriesResponse },
  })
  .post(
    "/",
    ({ body, userId }) => WorkEntryService.addEntries(userId!, body.entries),
    {
      requireAuth: true,
      body: AddWorkEntriesBody,
      response: { 200: AddWorkEntriesResponse },
    },
  )
  .delete(
    "/:id",
    ({ params, userId }) =>
      WorkEntryService.deleteEntry(userId!, Number(params.id)),
    {
      requireAuth: true,
      params: t.Object({ id: t.Numeric() }),
      response: { 200: DeleteWorkEntryResponse },
    },
  )
  .put(
    "/:id",
    ({ params, body, userId }) =>
      WorkEntryService.updateEntry(userId!, Number(params.id), body),
    {
      requireAuth: true,
      params: t.Object({ id: t.Numeric() }),
      body: UpdateWorkEntryBody,
      response: { 200: UpdateWorkEntryResponse },
    },
  );

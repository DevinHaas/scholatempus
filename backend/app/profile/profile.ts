import { api } from "encore.dev/api";

export const getProfile = api(
  { path: "/profile", method: "GET", auth: true },
  async () => {
    return { name: "John Doe" };
  },
);

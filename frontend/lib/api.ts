import axios from "axios";
import { Clerk } from "@clerk/clerk-js";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined" && window.Clerk) {
    const token = await window.Clerk.session?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

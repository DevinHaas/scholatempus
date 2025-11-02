import { useAuth } from "@clerk/nextjs";
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = useAuth().getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

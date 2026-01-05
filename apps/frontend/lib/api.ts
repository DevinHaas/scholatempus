import axios from "axios";

export const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

console.log("baseURL", baseURL);

export const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined" && (window as any).Clerk) {
    const token = await (window as any).Clerk.session?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

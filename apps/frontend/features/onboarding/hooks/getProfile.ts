import { api } from "@/lib/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import type { GetProfileResponse } from "@scholatempus/shared";
import { AxiosError } from "axios";

export const useGetProfile = () => {
  const { user, isLoaded } = useUser();
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
    enabled: !!user && !!isLoaded,
    retry: (failureCount, error) => {
      // Don't retry on 404 (profile not found is expected for new users)
      if (error instanceof AxiosError && error.response?.status === 500 || error instanceof AxiosError && error.response?.status === 404) {
        return false;
      }
      // Retry other errors up to 3 times (default behavior)
      return failureCount < 3;
    },
  });
};

const getProfile = async () => {
  const res = await api.get<GetProfileResponse>("/profile");
  console.log("res", res.data.profile);
  return res.data.profile;
};

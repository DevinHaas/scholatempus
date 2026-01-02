import { api } from "@/lib/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { GetWorkEntriesResponse } from "@scholatempus/shared";
import { AxiosError } from "axios";

export const useGetWorkEntries = () => {
  const { user, isLoaded } = useUser();
  return useQuery({
    queryKey: ["workEntries"],
    queryFn: () => getWorkEntries(),
    enabled: !!user && !!isLoaded,
    retry: (failureCount, error) => {
      // Don't retry on 404 (no work entries is expected for new users)
      if (
        error instanceof AxiosError &&
        (error.response?.status === 500 || error.response?.status === 404)
      ) {
        return false;
      }
      // Retry other errors up to 3 times (default behavior)
      return failureCount < 3;
    },
  });
};

const getWorkEntries = async () => {
  const res = await api.get<GetWorkEntriesResponse>("/workentries");
  console.log("work entries", res.data.workEntries);
  return res.data.workEntries ?? [];
};


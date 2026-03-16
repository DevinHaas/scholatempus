import { useEden } from "@/lib/eden";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

export const useGetProfile = () => {
  const eden = useEden();
  const { user, isLoaded } = useUser();
  return useQuery({
    ...eden.profile.get.queryOptions(),
    enabled: !!user && !!isLoaded,
    select: (data) => data?.profile,
    retry: (failureCount, error: any) => {
      if (error?.status === 500 || error?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

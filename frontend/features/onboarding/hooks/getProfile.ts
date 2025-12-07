import { api } from "@/lib/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { GetProfileResponse } from "scholatempus-backend/shared";

export const useGetProfile = () => {
  const { user, isLoaded } = useUser();
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
    enabled: !!user && !!isLoaded,
  });
};

const getProfile = async () => {
  const res = await api.get<GetProfileResponse>("/profile");
  console.log("res", res.data.profile);
  return res.data.profile;
};

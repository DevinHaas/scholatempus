import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ClassData,
  CreateProfileRequestData,
  SpecialFunctionData,
} from "scholatempus-backend/shared";
import { toast } from "sonner";

export const useCreateProfile = (
  classData: ClassData,
  specialFunctionData: SpecialFunctionData,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      createProfile({
        classData: classData,
        specialFunctionData: specialFunctionData,
      }),
    onSuccess: () => {
      toast.success("😀 Profile created successfully");
    },
    onError: () => {
      toast.error("😥 Problem creating profile", {
        description: "Please try again",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

const createProfile = async (
  createProfileRequestData: CreateProfileRequestData,
) => {
  return await api
    .post("/profile", createProfileRequestData)
    .then((res) => res.data);
};

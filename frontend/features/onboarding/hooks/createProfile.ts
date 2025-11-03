"use client";
import { api } from "@/lib/api";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { CreateProfileRequestData } from "scholatempus-backend/shared";
import { toast } from "sonner";

export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (createProfileRequestData: CreateProfileRequestData) =>
      createProfile(createProfileRequestData),
    onSuccess: () => {
      toast.success("😀 Profile created successfully");
    },
    onError: (error) => {
      console.log(error);
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

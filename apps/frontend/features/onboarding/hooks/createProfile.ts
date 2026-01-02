"use client";
import { api } from "@/lib/api";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { UpsertProfileRequestData } from "@scholatempus/shared";
import { toast } from "sonner";

export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (createProfileRequestData: UpsertProfileRequestData) =>
      createProfile(createProfileRequestData),
    onSuccess: async () => {
      // Update Clerk user metadata to indicate profile exists
      try {
        await fetch("/api/user/update-profile-metadata", {
          method: "POST",
        });
      } catch (error) {
        console.error("Failed to update user metadata:", error);
        // Don't show error to user as profile was created successfully
        // The metadata update is a nice-to-have
      }
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
  createProfileRequestData: UpsertProfileRequestData,
) => {
  return await api
    .put("/profile", createProfileRequestData)
    .then((res) => res.data);
};

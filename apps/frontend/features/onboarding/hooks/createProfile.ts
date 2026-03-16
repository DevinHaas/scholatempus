"use client";
import { useEden } from "@/lib/eden";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateProfile = () => {
  const eden = useEden();
  const queryClient = useQueryClient();

  return useMutation({
    ...eden.profile.put.mutationOptions(),
    onSuccess: async () => {
      try {
        await fetch("/api/user/update-profile-metadata", {
          method: "POST",
        });
      } catch (error) {
        console.error("Failed to update user metadata:", error);
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

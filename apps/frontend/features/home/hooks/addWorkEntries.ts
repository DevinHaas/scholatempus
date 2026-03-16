"use client";
import { useEden } from "@/lib/eden";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAddWorkEntries = () => {
  const eden = useEden();
  const queryClient = useQueryClient();

  return useMutation({
    ...eden.workentries.post.mutationOptions(),
    onSuccess: (data) => {
      toast.success(
        `😀 ${data.count} work entr${data.count === 1 ? "y" : "ies"} saved successfully`,
      );
    },
    onError: (error) => {
      console.log(error);
      toast.error("😥 Problem saving work entries", {
        description: "Please try again",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: eden.workentries.get.queryKey(),
      });
    },
  });
};

"use client";
import { edenClient, useEden } from "@/lib/eden";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteWorkEntry = () => {
  const eden = useEden();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: number) => {
      const { data, error } = await edenClient
        .workentries({ id: entryId })
        .delete();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Work entry deleted successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to delete work entry", {
        description: "Please try again",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [eden.workentries.get.queryKey()],
      });
    },
  });
};

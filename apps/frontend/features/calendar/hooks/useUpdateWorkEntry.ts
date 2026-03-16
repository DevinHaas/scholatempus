"use client";
import { edenClient, useEden } from "@/lib/eden";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { UpdateWorkEntryBodyType } from "@backend/modules/workentries/model";

type UpdateWorkEntryInput = { id: number } & UpdateWorkEntryBodyType;

export const useUpdateWorkEntry = () => {
  const eden = useEden();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: UpdateWorkEntryInput) => {
      const { data, error } = await edenClient.workentries({ id }).put(body);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Work entry updated successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to update work entry", {
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

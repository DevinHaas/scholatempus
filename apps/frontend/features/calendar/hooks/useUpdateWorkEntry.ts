"use client";
import { api } from "@/lib/api";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import type {
  UpdateWorkEntryRequest,
  UpdateWorkEntryResponse,
} from "@scholatempus/shared";
import { toast } from "sonner";

export const useUpdateWorkEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      data,
    }: {
      entryId: number;
      data: UpdateWorkEntryRequest;
    }) => updateWorkEntry(entryId, data),
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
      queryClient.invalidateQueries({ queryKey: ["workEntries"] });
    },
  });
};

const updateWorkEntry = async (
  entryId: number,
  data: UpdateWorkEntryRequest
) => {
  return await api
    .put<UpdateWorkEntryResponse>(`/workentries/${entryId}`, { ...data, id: entryId })
    .then((res) => res.data);
};


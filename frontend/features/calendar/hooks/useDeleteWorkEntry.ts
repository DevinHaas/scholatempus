"use client";
import { api } from "@/lib/api";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { DeleteWorkEntryResponse } from "scholatempus-backend/shared";
import { toast } from "sonner";

export const useDeleteWorkEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: number) => deleteWorkEntry(entryId),
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
      queryClient.invalidateQueries({ queryKey: ["workEntries"] });
    },
  });
};

const deleteWorkEntry = async (entryId: number) => {
  return await api
    .delete<DeleteWorkEntryResponse>(`/workentries/${entryId}`)
    .then((res) => res.data);
};



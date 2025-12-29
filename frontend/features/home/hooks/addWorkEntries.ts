"use client";
import { api } from "@/lib/api";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { AddWorkEntriesRequest } from "scholatempus-backend/shared";
import { toast } from "sonner";

export const useAddWorkEntries = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workEntriesRequest: AddWorkEntriesRequest) =>
      addWorkEntries(workEntriesRequest),
    onSuccess: (data) => {
      toast.success(`😀 ${data.count} work entr${data.count === 1 ? "y" : "ies"} saved successfully`);
    },
    onError: (error) => {
      console.log(error);
      toast.error("😥 Problem saving work entries", {
        description: "Please try again",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workEntries"] });
    },
  });
};

const addWorkEntries = async (workEntriesRequest: AddWorkEntriesRequest) => {
  return await api
    .post("/workentries", workEntriesRequest)
    .then((res) => res.data);
};


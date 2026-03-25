"use client";
import { edenClient, useEden } from "@/lib/eden";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ParsedImportEntry } from "@/lib/services/importWorkEntries";

export const useImportWorkEntries = () => {
  const eden = useEden();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entries: ParsedImportEntry[]) => {
      const { data, error } = await edenClient.workentries.import.post({
        entries: entries.map((e) => ({
          date: e.date,
          workingTime: e.workingTime,
          category: e.category,
          subcategory: e.subcategory,
        })),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(
        `${data?.count ?? 0} Einträge erfolgreich importiert.`,
      );
    },
    onError: () => {
      toast.error("Import fehlgeschlagen", {
        description: "Bitte versuchen Sie es erneut.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [eden.workentries.get.queryKey()],
      });
    },
  });
};

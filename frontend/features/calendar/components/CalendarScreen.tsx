"use client";

import { useState, useMemo, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useGetWorkEntries } from "@/features/profile/hooks/useGetWorkEntries";
import { WorkEntriesTable, type WorkEntry } from "./WorkEntriesTable";
import {
  getWeekStart,
  getWeekRange,
  isDateInRange,
} from "@/lib/helpers/calendarHelpers";
import { CategorySelectionDialog } from "@/features/home/components/CategorySelectionDialog";
import { useDeleteWorkEntry } from "../hooks/useDeleteWorkEntry";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DateRangePicker } from "./DateRangePicker";

export function CalendarScreen() {
  // Initialize with current week range
  const [dateRange, setDateRange] = useState(() => {
    const weekRange = getWeekRange(getWeekStart(new Date()));
    return {
      start: weekRange.start,
      end: weekRange.end,
    };
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const [selectedDateForNewEntry, setSelectedDateForNewEntry] = useState<Date>(
    () => new Date()
  );

  const { data: allEntries = [], isLoading } = useGetWorkEntries();
  const deleteWorkEntryMutation = useDeleteWorkEntry();

  // Filter entries for the selected date range
  const filteredEntries = useMemo(() => {
    return allEntries.filter((entry) => {
      const entryDate =
        typeof entry.date === "string" ? new Date(entry.date) : entry.date;
      return isDateInRange(entryDate, dateRange);
    });
  }, [allEntries, dateRange]);

  const handleAddEntry = () => {
    setEditingEntry(null);
    // Default to today if in current range, otherwise start of range
    const today = new Date();
    const defaultDate = isDateInRange(today, dateRange)
      ? today
      : dateRange.start;
    setSelectedDateForNewEntry(defaultDate);
    setDialogOpen(true);
  };

  const handleEditEntry = (entry: WorkEntry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const handleDeleteClick = (entryId: number) => {
    setEntryToDelete(entryId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (entryToDelete !== null) {
      deleteWorkEntryMutation.mutate(entryToDelete, {
        onSuccess: () => {
          setDeleteConfirmOpen(false);
          setEntryToDelete(null);
        },
      });
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingEntry(null);
  };

  const handleDialogCancel = () => {
    handleDialogClose();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">Calendar</h1>

          {/* Date Range Picker and Actions */}
          <div className="flex items-center justify-between mb-4">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <Button onClick={handleAddEntry} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </div>

        {/* Work Entries Table */}
        <div className="w-full">
          <Suspense fallback={<div>Loading Entries...</div>}>
            <WorkEntriesTable
              data={filteredEntries}
            onEdit={handleEditEntry}
            onDelete={handleDeleteClick}
            />
          </Suspense>
        </div>

        {/* Add/Edit Entry Dialog */}
        <CategorySelectionDialog
          open={dialogOpen}
          onOpenChangeAction={setDialogOpen}
          totalTime={0}
          onCancelAction={handleDialogCancel}
          entryToEdit={editingEntry || undefined}
          selectedDate={selectedDateForNewEntry}
          isCalendarContext={true}
          isManually={true}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Work Entry</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this work entry? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setEntryToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteWorkEntryMutation.isPending}
              >
                {deleteWorkEntryMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

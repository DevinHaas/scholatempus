"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useGetWorkEntries } from "@/features/profile/hooks/useGetWorkEntries";
import { WorkEntriesTable, type WorkEntry } from "./WorkEntriesTable";
import {
  getWeekStart,
  getWeekEnd,
  getWeekRange,
  formatWeekRange,
  getNextWeek,
  getPreviousWeek,
  isDateInWeek,
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

export function CalendarScreen() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getWeekStart(new Date())
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const [selectedDateForNewEntry, setSelectedDateForNewEntry] = useState<Date>(
    () => new Date()
  );

  const { data: allEntries = [], isLoading } = useGetWorkEntries();
  const deleteWorkEntryMutation = useDeleteWorkEntry();

  const weekRange = useMemo(
    () => getWeekRange(currentWeekStart),
    [currentWeekStart]
  );

  // Filter entries for the current week
  const weekEntries = useMemo(() => {
    return allEntries.filter((entry) => {
      const entryDate =
        typeof entry.date === "string" ? new Date(entry.date) : entry.date;
      return isDateInWeek(entryDate, currentWeekStart);
    });
  }, [allEntries, currentWeekStart]);

  const handlePreviousWeek = () => {
    setCurrentWeekStart(getPreviousWeek(currentWeekStart));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(getNextWeek(currentWeekStart));
  };

  const handleToday = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  const handleAddEntry = () => {
    setEditingEntry(null);
    // Default to today if in current week, otherwise first day of week
    const today = new Date();
    const defaultDate = isDateInWeek(today, currentWeekStart)
      ? today
      : currentWeekStart;
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

          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousWeek}
                className="h-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center min-w-[200px]">
                <div className="text-sm font-medium">
                  {formatWeekRange(weekRange.start, weekRange.end)}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextWeek}
                className="h-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button onClick={handleAddEntry} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </div>

        {/* Work Entries Table */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading entries...
          </div>
        ) : (
          <WorkEntriesTable
            data={weekEntries}
            onEdit={handleEditEntry}
            onDelete={handleDeleteClick}
          />
        )}

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

"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  WORK_TIME_CATEGORY_LABELS,
  TEACHING_ADVINSING_SUPPORTING_SUBCATEGORIES_LABELS,
} from "@scholatempus/shared/enums";
import { formatDateForTable } from "@/lib/helpers/calendarHelpers";

export type WorkEntry = {
  workTimeEntryId: number;
  userId: string;
  date: Date | string;
  workingTime: number;
  category: string;
  subcategory: string | null;
};

interface WorkEntriesTableProps {
  data: WorkEntry[];
  onEdit: (entry: WorkEntry) => void;
  onDelete: (entryId: number) => void;
  onDeleteMultiple?: (entryIds: number[]) => void;
}

export function WorkEntriesTable({
  data,
  onEdit,
  onDelete,
  onDeleteMultiple,
}: WorkEntriesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const formatWorkingTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}min` : ""}`;
    }
    return `${mins}min`;
  };

  const selectedIds = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => data[parseInt(key)]?.workTimeEntryId)
    .filter((id): id is number => id !== undefined);

  const columns: ColumnDef<WorkEntry>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Alle auswählen"
          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Zeile auswählen"
          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-0.5 sm:gap-1 font-medium"
          >
            <span className="sm:hidden">Dat.</span>
            <span className="hidden sm:inline">Datum</span>
            <ArrowUpDown size={10} className="sm:hidden" />
            <ArrowUpDown size={16} className="hidden sm:block" />
          </button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("date") as Date | string;
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return (
          <>
            <div className="sm:hidden">
              {formatDateForTable(dateObj, "short")}
            </div>
            <div className="hidden sm:block">{formatDateForTable(dateObj)}</div>
          </>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.date;
        const dateB = rowB.original.date;
        const dateAObj = typeof dateA === "string" ? new Date(dateA) : dateA;
        const dateBObj = typeof dateB === "string" ? new Date(dateB) : dateB;
        return dateAObj.getTime() - dateBObj.getTime();
      },
    },
    {
      accessorKey: "category",
      header: () => (
        <>
          <span className="sm:hidden">Kat.</span>
          <span className="hidden sm:inline">Kategorie</span>
        </>
      ),
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        const label =
          WORK_TIME_CATEGORY_LABELS[
            category as keyof typeof WORK_TIME_CATEGORY_LABELS
          ] || category;
        return (
          <div className="max-w-[50px] sm:max-w-none truncate" title={label}>
            {label}
          </div>
        );
      },
    },
    {
      accessorKey: "subcategory",
      header: () => (
        <>
          <span className="sm:hidden">Sub.</span>
          <span className="hidden sm:inline">Unterkategorie</span>
        </>
      ),
      cell: ({ row }) => {
        const subcategory = row.getValue("subcategory") as string | null;
        if (!subcategory) return <div className="text-muted-foreground">—</div>;
        const subLabel =
          TEACHING_ADVINSING_SUPPORTING_SUBCATEGORIES_LABELS[
            subcategory as keyof typeof TEACHING_ADVINSING_SUPPORTING_SUBCATEGORIES_LABELS
          ] || subcategory;
        return (
          <div className="max-w-[50px] sm:max-w-none truncate" title={subLabel}>
            {subLabel}
          </div>
        );
      },
    },
    {
      accessorKey: "workingTime",
      header: ({ column }) => {
        return (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-0.5 sm:gap-1 font-medium"
          >
            <span className="sm:hidden">Zeit</span>
            <span className="hidden sm:inline">Arbeitszeit</span>
            <ArrowUpDown size={10} className="sm:hidden" />
            <ArrowUpDown size={16} className="hidden sm:block" />
          </button>
        );
      },
      cell: ({ row }) => {
        const minutes = row.getValue("workingTime") as number;
        return <div className="font-medium">{formatWorkingTime(minutes)}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const entry = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(entry)}>
                <Pencil className="mr-2 h-4 w-4" />
                Bearbeiten
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(entry.workTimeEntryId)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-sm text-muted-foreground">
            {selectedIds.length} ausgewählt
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onDeleteMultiple?.(selectedIds);
              setRowSelection({});
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {selectedIds.length} löschen
          </Button>
        </div>
      )}
      <div className="overflow-hidden rounded-md border">
        <Table className="text-xs sm:text-sm [&_td]:p-1 sm:[&_td]:p-2 [&_th]:px-1 sm:[&_th]:px-2">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className=" text-center">
                  Keine Einträge vorhanden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
}

export function WorkEntriesTable({
  data,
  onEdit,
  onDelete,
}: WorkEntriesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const formatWorkingTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}min` : ""}`;
    }
    return `${mins}min`;
  };

  const columns: ColumnDef<WorkEntry>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("date") as Date | string;
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return <div>{formatDateForTable(dateObj)}</div>;
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
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        return (
          <div>
            {WORK_TIME_CATEGORY_LABELS[category as keyof typeof WORK_TIME_CATEGORY_LABELS] ||
              category}
          </div>
        );
      },
    },
    {
      accessorKey: "subcategory",
      header: "Subcategory",
      cell: ({ row }) => {
        const subcategory = row.getValue("subcategory") as string | null;
        if (!subcategory) return <div className="text-muted-foreground">—</div>;
        return (
          <div>
            {TEACHING_ADVINSING_SUPPORTING_SUBCATEGORIES_LABELS[
              subcategory as keyof typeof TEACHING_ADVINSING_SUPPORTING_SUBCATEGORIES_LABELS
            ] || subcategory}
          </div>
        );
      },
    },
    {
      accessorKey: "workingTime",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Working Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
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
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(entry)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(entry.workTimeEntryId)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
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
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No entries found for this week.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-md border">
        <Table>
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
                            header.getContext()
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
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


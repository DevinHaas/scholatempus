"use client";

import { useRef, useState, useCallback } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useImportWorkEntries } from "../hooks/useImportWorkEntries";
import {
  parseExcelFile,
  parseCsvFile,
  type ParsedImportEntry,
} from "@/lib/services/importWorkEntries";

interface ImportWidgetProps {
  onSuccess?: () => void;
  onSkip?: () => void;
  compact?: boolean;
}

interface ParsedState {
  bySheet: Record<string, ParsedImportEntry[]>;
  sheetOrder: string[];
  errors: string[];
}

export function ImportWidget({ onSuccess, onSkip, compact }: ImportWidgetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsed, setParsed] = useState<ParsedState | null>(null);
  const [selectedSheets, setSelectedSheets] = useState<Set<string>>(new Set());
  const mutation = useImportWorkEntries();

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const mergedBySheet: Record<string, ParsedImportEntry[]> = {};
    const sheetOrder: string[] = [];
    const allErrors: string[] = [];

    for (const file of fileArray) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      let result;

      if (ext === "csv") {
        result = parseCsvFile(await file.text(), file.name);
      } else if (ext === "xlsx" || ext === "xls") {
        result = parseExcelFile(await file.arrayBuffer());
      } else {
        allErrors.push(`Nicht unterstütztes Dateiformat: ${file.name}`);
        continue;
      }

      for (const [sheet, entries] of Object.entries(result.bySheet)) {
        if (!mergedBySheet[sheet]) {
          mergedBySheet[sheet] = [];
          sheetOrder.push(sheet);
        }
        mergedBySheet[sheet]!.push(...entries);
      }
      allErrors.push(...result.errors);
    }

    setParsed({ bySheet: mergedBySheet, sheetOrder, errors: allErrors });
    setSelectedSheets(new Set(sheetOrder)); // all selected by default
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  const toggleSheet = (sheet: string) => {
    setSelectedSheets((prev) => {
      const next = new Set(prev);
      next.has(sheet) ? next.delete(sheet) : next.add(sheet);
      return next;
    });
  };

  const selectedEntries = parsed
    ? parsed.sheetOrder
        .filter((s) => selectedSheets.has(s))
        .flatMap((s) => parsed.bySheet[s] ?? [])
    : [];

  const handleImport = () => {
    if (selectedEntries.length === 0) return;
    mutation.mutate(selectedEntries, { onSuccess: () => onSuccess?.() });
  };

  return (
    <div className={cn("flex flex-col gap-4", compact ? "max-w-md" : "max-w-lg mx-auto")}>
      {!compact && (
        <div className="text-center mb-2">
          <h2 className="text-xl font-semibold">Arbeitsdaten importieren</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Importieren Sie Ihre bisherigen Arbeitseinträge aus der
            kantonalen Arbeitszeiterfassung (Excel oder CSV).
          </p>
        </div>
      )}

      {/* Drop zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors",
          compact ? "p-6" : "p-10",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30",
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">Datei hierher ziehen oder klicken</p>
          <p className="text-xs text-muted-foreground mt-1">
            .xlsx, .xls oder mehrere .csv Dateien
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) processFiles(e.target.files);
          }}
        />
      </div>

      {/* Sheet selection */}
      {parsed && parsed.sheetOrder.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <ScrollArea className="h-64">
            <div className="divide-y">
              {parsed.sheetOrder.map((sheet) => {
                const count = parsed.bySheet[sheet]?.length ?? 0;
                const enabled = selectedSheets.has(sheet);
                return (
                  <div
                    key={sheet}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{sheet}</span>
                      <span className="text-xs text-muted-foreground">
                        {count} {count === 1 ? "Eintrag" : "Einträge"}
                      </span>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={() => toggleSheet(sheet)}
                      disabled={mutation.isPending}
                    />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Errors */}
      {parsed && parsed.errors.length > 0 && (
        <ul className="space-y-1">
          {parsed.errors.map((err, i) => (
            <li key={i} className="text-destructive text-xs">{err}</li>
          ))}
        </ul>
      )}

      {/* Empty state after parse */}
      {parsed && parsed.sheetOrder.length === 0 && parsed.errors.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">Keine Einträge gefunden.</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {selectedEntries.length > 0
            ? `${selectedEntries.length} Einträge ausgewählt`
            : parsed
              ? "Keine Einträge ausgewählt"
              : ""}
        </p>
        <div className="flex gap-2">
          {onSkip && (
            <Button variant="ghost" onClick={onSkip} disabled={mutation.isPending}>
              Überspringen
            </Button>
          )}
          <Button
            onClick={handleImport}
            disabled={selectedEntries.length === 0 || mutation.isPending}
          >
            {mutation.isPending ? "Wird importiert…" : "Importieren"}
          </Button>
        </div>
      </div>
    </div>
  );
}

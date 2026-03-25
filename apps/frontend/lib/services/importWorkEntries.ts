import * as XLSX from "xlsx";
import {
  WorkTimeCategory,
  WorkTimeSubCategory,
} from "@scholatempus/shared/enums";

export interface ParsedImportEntry {
  date: string; // ISO string
  workingTime: number; // minutes for hour-based categories; raw lesson count for TeachingSupervision
  category: WorkTimeCategory;
  subcategory?: WorkTimeSubCategory;
}

export interface ParseResult {
  entries: ParsedImportEntry[];
  bySheet: Record<string, ParsedImportEntry[]>;
  monthsFound: string[];
  errors: string[];
}

const LOG_PREFIX = "[Import]";

// Excel date serial → JS Date (epoch: Dec 30, 1899)
export function excelSerialToDate(serial: number): Date {
  const msPerDay = 86400000;
  // Excel incorrectly treats 1900 as a leap year; offset by 25569 days from Unix epoch
  return new Date((serial - 25569) * msPerDay);
}

// A sheet is valid if row index 1 (0-based), column 0 === "Tag"
export function isValidMonthSheet(rows: unknown[][]): boolean {
  return (
    Array.isArray(rows) &&
    rows.length > 2 &&
    Array.isArray(rows[1]) &&
    rows[1][0] === "Tag"
  );
}

// Column mapping (0-indexed):
// 0  = Tag (date serial)
// 4  = AZ SL          → SchoolManagement         hours × 60
// 5  = Unterrichtskontrolle → TeachingSupervision  lessons (raw count, no conversion)
// 6  = Unterricht      → TeachingAdvisingSupporting/Class  hours × 60
// 7  = Vor-/Nachbereitung → TeachingAdvisingSupporting/Preparation hours × 60
// 8  = Beraten, begleiten → TeachingAdvisingSupporting/Supporting  hours × 60
// 9  = AZ Zusammenarbeit → Collaboration           hours × 60
// 10 = AZ Weiterbildung  → FurtherEducation         hours × 60

const COL_MAPPINGS: Array<{
  col: number;
  label: string;
  category: WorkTimeCategory;
  subcategory?: WorkTimeSubCategory;
  multiplier: number;
  round?: boolean; // false = preserve decimals (e.g. 0.5 lessons)
}> = [
  { col: 4, label: "AZ SL", category: WorkTimeCategory.SchoolManagement, multiplier: 60 },
  { col: 5, label: "Unterrichtskontrolle", category: WorkTimeCategory.TeachingSupervision, multiplier: 1, round: false },
  {
    col: 6,
    label: "Unterricht",
    category: WorkTimeCategory.TeachingAdvisingSupporting,
    subcategory: WorkTimeSubCategory.Class,
    multiplier: 60,
  },
  {
    col: 7,
    label: "Vor-/Nachbereitung",
    category: WorkTimeCategory.TeachingAdvisingSupporting,
    subcategory: WorkTimeSubCategory.Preparation,
    multiplier: 60,
  },
  {
    col: 8,
    label: "Beraten, begleiten",
    category: WorkTimeCategory.TeachingAdvisingSupporting,
    subcategory: WorkTimeSubCategory.Supporting,
    multiplier: 60,
  },
  { col: 9, label: "AZ Zusammenarbeit", category: WorkTimeCategory.Collaboration, multiplier: 60 },
  { col: 10, label: "AZ Weiterbildung", category: WorkTimeCategory.FurtherEducation, multiplier: 60 },
];

export function parseMonthSheet(
  sheetName: string,
  rows: unknown[][],
): ParsedImportEntry[] {
  const entries: ParsedImportEntry[] = [];
  let skippedRows = 0;

  console.group(`${LOG_PREFIX} Sheet "${sheetName}" — ${rows.length - 3} data rows`);

  // Data rows start at index 3 (row 4 in 1-based)
  for (let i = 3; i < rows.length; i++) {
    const excelRow = i + 1; // 1-based row number as seen in Excel
    const row = rows[i];

    if (!Array.isArray(row)) {
      console.debug(`${LOG_PREFIX}   Row ${excelRow}: skipped (not an array)`);
      skippedRows++;
      continue;
    }

    const dateSerial = row[0];
    if (typeof dateSerial !== "number" || dateSerial <= 0) {
      skippedRows++;
      continue;
    }

    const date = excelSerialToDate(dateSerial);
    const dateStr = date.toISOString().split("T")[0]!;
    const rowEntries: string[] = [];

    for (const mapping of COL_MAPPINGS) {
      const val = row[mapping.col];
      if (typeof val !== "number" || val <= 0) continue;

      const raw = val * mapping.multiplier;
      const workingTime = mapping.round === false ? raw : Math.round(raw);
      if (workingTime <= 0) continue;

      entries.push({
        date: dateStr,
        workingTime,
        category: mapping.category,
        subcategory: mapping.subcategory,
      });

      const unit = mapping.round === false ? "Lekt." : "min";
      rowEntries.push(
        `${mapping.label}: ${val} → ${workingTime} ${unit}`,
      );
    }

    if (rowEntries.length > 0) {
      console.log(
        `${LOG_PREFIX}   Row ${excelRow} (${dateStr}): ${rowEntries.join(" | ")}`,
      );
    }
  }

  console.log(
    `${LOG_PREFIX} Sheet "${sheetName}" summary: ${entries.length} entries parsed, ${skippedRows} rows skipped`,
  );
  console.groupEnd();

  return entries;
}

export function parseExcelFile(buffer: ArrayBuffer): ParseResult {
  const entries: ParsedImportEntry[] = [];
  const monthsFound: string[] = [];
  const errors: string[] = [];

  const bySheet: Record<string, ParsedImportEntry[]> = {};

  console.group(`${LOG_PREFIX} Parsing Excel file (${(buffer.byteLength / 1024).toFixed(1)} KB)`);

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array" });
  } catch (err) {
    console.error(`${LOG_PREFIX} Failed to read workbook:`, err);
    console.groupEnd();
    return { entries: [], bySheet: {}, monthsFound: [], errors: ["Datei konnte nicht gelesen werden."] };
  }

  console.log(`${LOG_PREFIX} Sheets found: [${workbook.SheetNames.join(", ")}]`);

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]!;
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: null,
    }) as unknown[][];

    if (!isValidMonthSheet(rows)) {
      console.log(`${LOG_PREFIX} Sheet "${sheetName}": skipped (header row[1][0] = ${JSON.stringify((rows[1] as any)?.[0])})`);
      continue;
    }

    monthsFound.push(sheetName);
    const sheetEntries = parseMonthSheet(sheetName, rows);
    bySheet[sheetName] = sheetEntries;
    entries.push(...sheetEntries);
  }

  if (monthsFound.length === 0) {
    const msg = "Keine gültigen Monatsblätter gefunden. Stellen Sie sicher, dass die Datei das korrekte Format hat.";
    console.warn(`${LOG_PREFIX} ${msg}`);
    errors.push(msg);
  } else {
    console.log(
      `${LOG_PREFIX} Done — ${entries.length} total entries from ${monthsFound.length} sheet(s): [${monthsFound.join(", ")}]`,
    );
  }

  console.groupEnd();
  return { entries, bySheet, monthsFound, errors };
}

export function parseCsvFile(text: string, fileName?: string): ParseResult {
  const entries: ParsedImportEntry[] = [];
  const errors: string[] = [];
  const label = fileName ?? "unknown";

  const bySheet: Record<string, ParsedImportEntry[]> = {};

  console.group(`${LOG_PREFIX} Parsing CSV file "${label}" (${(text.length / 1024).toFixed(1)} KB)`);

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(text, { type: "string" });
  } catch (err) {
    console.error(`${LOG_PREFIX} Failed to read CSV:`, err);
    console.groupEnd();
    return {
      entries: [],
      bySheet: {},
      monthsFound: [],
      errors: [`CSV-Datei konnte nicht gelesen werden: ${label}`],
    };
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    console.warn(`${LOG_PREFIX} CSV has no sheets`);
    console.groupEnd();
    return { entries: [], bySheet: {}, monthsFound: [], errors: ["Leere CSV-Datei."] };
  }

  const sheet = workbook.Sheets[sheetName]!;
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
  }) as unknown[][];

  if (!isValidMonthSheet(rows)) {
    const msg = `CSV-Datei hat nicht das erwartete Format (Spalte «Tag» fehlt): ${label}`;
    console.warn(`${LOG_PREFIX} ${msg} — row[1][0] = ${JSON.stringify((rows[1] as any)?.[0])}`);
    errors.push(msg);
    console.groupEnd();
    return { entries, bySheet: {}, monthsFound: [], errors };
  }

  const sheetLabel = fileName?.replace(/\.csv$/i, "") ?? sheetName;
  const sheetEntries = parseMonthSheet(sheetLabel, rows);
  bySheet[sheetLabel] = sheetEntries;
  entries.push(...sheetEntries);

  console.log(`${LOG_PREFIX} Done — ${entries.length} entries from CSV "${label}"`);
  console.groupEnd();

  return { entries, bySheet, monthsFound: [sheetLabel], errors };
}

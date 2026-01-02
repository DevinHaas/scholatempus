import fs from "node:fs";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ENDPOINT =
  "http://127.0.0.1:7244/ingest/83dca9b1-745b-44f9-91e0-5ea00220fbaa";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// frontend/scripts -> frontend -> repo root
const repoRoot = path.resolve(__dirname, "..", "..");
const LOG_PATH = path.join(repoRoot, ".cursor", "debug.log");

const runId = process.env.SCHOLA_DEBUG_RUN_ID || "pre-fix";
const sessionId = "debug-session";

function log(hypothesisId, location, message, data = {}) {
  const payload = {
    sessionId,
    runId,
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  };

  // Best-effort: send to debug ingest server (if available).
  fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});

  // Best-effort fallback: append NDJSON directly to workspace debug log.
  try {
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    fs.appendFileSync(LOG_PATH, `${JSON.stringify(payload)}\n`, "utf8");
  } catch {
    // ignore
  }
}

function safeReadText(filePath, maxBytes = 50_000) {
  try {
    const buf = fs.readFileSync(filePath);
    return buf.subarray(0, maxBytes).toString("utf8");
  } catch {
    return null;
  }
}

// #region agent log
log("H2", "frontend/scripts/ts-build-diagnose.mjs:39", "diagnose start", {
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  cwd: process.cwd(),
  memory: process.memoryUsage(),
});
// #endregion

// #region agent log
try {
  const nextConfigPath = path.join(process.cwd(), "next.config.ts");
  const nextConfig = safeReadText(nextConfigPath);
  log("H2", "frontend/scripts/ts-build-diagnose.mjs:55", "next.config.ts scan", {
    nextConfigPath,
    hasTurbopackRoot: !!nextConfig?.includes("turbopack"),
    mentionsRepoRoot: !!nextConfig?.includes("path.join(__dirname, '..')"),
  });
} catch (e) {
  log("H2", "frontend/scripts/ts-build-diagnose.mjs:62", "next.config.ts scan failed", {
    error: String(e?.message || e),
  });
}
// #endregion

const require = createRequire(import.meta.url);

// #region agent log
try {
  const ts = require("typescript");
  const tscVersion = ts?.version ?? null;
  const configPath = path.join(process.cwd(), "tsconfig.json");
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    process.cwd(),
    undefined,
    configPath,
  );
  log("H1", "frontend/scripts/ts-build-diagnose.mjs:111", "tsconfig parse", {
    tscVersion,
    configPath,
    rootFileCount: parsed.fileNames?.length ?? null,
    errorCount: parsed.errors?.length ?? 0,
  });
} catch (e) {
  log("H1", "frontend/scripts/ts-build-diagnose.mjs:120", "tsconfig parse failed", {
    error: String(e?.message || e),
  });
}
// #endregion

// #region agent log
try {
  const resolved = require.resolve("@scholatempus/shared");
  log("H1", "frontend/scripts/ts-build-diagnose.mjs:74", "resolved @scholatempus/shared", {
    resolved,
  });

  const entry = safeReadText(resolved);
  log("H1", "frontend/scripts/ts-build-diagnose.mjs:80", "shared entry scan", {
    resolved,
    hasExportTypes: !!entry?.includes('export * from "./types"'),
    hasExportSchemas: !!entry?.includes('export * from "./schemas"'),
  });

  const typesPath = path.join(path.dirname(resolved), "types.ts");
  const typesText = safeReadText(typesPath);
  log("H1", "frontend/scripts/ts-build-diagnose.mjs:89", "shared/types.ts scan", {
    typesPath,
    importsDrizzleOrm: !!typesText?.includes("drizzle-orm"),
    importsBackendDbSchema: !!typesText?.includes("../db/schema"),
  });
} catch (e) {
  log("H1", "frontend/scripts/ts-build-diagnose.mjs:97", "resolve @scholatempus/shared failed", {
    error: String(e?.message || e),
  });
}
// #endregion

// #region agent log
try {
  const runHeavy = process.env.SCHOLA_DIAG_RUN_TSC === "1";
  log("H1", "frontend/scripts/ts-build-diagnose.mjs:142", "tsc extendedDiagnostics gate", {
    runHeavy,
  });

  if (runHeavy) {
    const out = execSync("pnpm -s tsc --noEmit --pretty false --extendedDiagnostics", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 20 * 1024 * 1024,
    });

    const filesLine = out.split("\n").find((l) => l.trim().startsWith("Files:"));
    const memLine = out.split("\n").find((l) => l.trim().startsWith("Memory used:"));
    log("H1", "frontend/scripts/ts-build-diagnose.mjs:155", "tsc extendedDiagnostics", {
      filesLine: filesLine?.trim() ?? null,
      memLine: memLine?.trim() ?? null,
    });
  }
} catch (e) {
  log("H1", "frontend/scripts/ts-build-diagnose.mjs:124", "tsc extendedDiagnostics failed", {
    error: String(e?.message || e),
  });
}
// #endregion

// #region agent log
log("H2", "frontend/scripts/ts-build-diagnose.mjs:132", "diagnose end", {
  memory: process.memoryUsage(),
});
// #endregion


# Migration Guide: packages/shared → backend/shared

This document explains the migration from the separate `packages/shared` workspace package to the integrated `backend/shared` folder.

## Why We Migrated

According to Encore.ts documentation:
> "The Encore.ts application must use one package with a single package.json file. Other separate packages must be pre-transpiled to JavaScript."

While we had pre-transpiled the shared package using TSUP, Encore's parser still had issues resolving:
1. TypeScript type-only imports from workspace packages
2. Certain npm packages (like `zod`) when imported in workspace dependencies
3. Subpath exports from workspace packages

By moving shared code into the backend application as an internal folder, we:
- ✅ Comply with Encore's recommended architecture
- ✅ Avoid parser limitations with workspace packages
- ✅ Enable direct TypeScript imports without pre-transpilation
- ✅ Still allow frontend to import types and schemas

## What Changed

### Before
```
scholatempus/
├── frontend/
├── backend/
└── packages/
    └── shared/        # Separate package
        ├── package.json
        ├── tsconfig.json
        ├── tsup.config.ts
        └── src/
            ├── enums.ts
            ├── schemas.ts
            └── index.ts
```

### After
```
scholatempus/
├── frontend/
└── backend/
    └── shared/        # Internal folder (no package.json)
        ├── enums.ts
        ├── schemas.ts
        ├── types.ts   # New: explicit types for Encore
        ├── index.ts
        └── README.md
```

## Import Changes

### Backend Imports

**Before:**
```typescript
import { ClassData, GradeLevel } from "@scholatempus/shared";
```

**After:**
```typescript
// Using path alias (recommended)
import { ClassData, GradeLevel } from "~/shared";

// Or using relative path
import { ClassData, GradeLevel } from "../../shared";
```

### Frontend Imports

**Before:**
```typescript
import { ClassData, GradeLevel } from "@scholatempus/shared";
```

**After:**
```typescript
import { ClassData, GradeLevel } from "scholatempus-backend/shared";
```

## Technical Changes

### 1. Backend package.json
Added exports configuration to allow frontend imports:

```json
{
  "name": "scholatempus-backend",
  "exports": {
    "./shared": "./shared/index.ts",
    "./shared/*": "./shared/*.ts"
  },
  "dependencies": {
    "zod": "^3.25.67"  // Moved from devDependencies
  }
}
```

### 2. Backend tsconfig.json
Added path aliases for convenient imports:

```json
{
  "compilerOptions": {
    "paths": {
      "~encore/*": ["./encore.gen/*"],
      "~/shared": ["./shared/index.ts"],
      "~/shared/*": ["./shared/*"]
    }
  }
}
```

### 3. Frontend package.json
Changed dependency from shared package to backend:

```json
{
  "dependencies": {
    "scholatempus-backend": "workspace:*",  // Added
    // "@scholatempus/shared": "workspace:*"  // Removed
    "zod": "3.25.67"  // Must match backend version
  }
}
```

### 4. New types.ts File
Created explicit TypeScript types to avoid Encore parser issues with `z.infer`:

**backend/shared/types.ts:**
```typescript
import { GradeLevel } from "./enums";

export interface ClassData {
  grade: GradeLevel;
  givenLectures: number;
  mandatoryLectures: number;
  carryOverLectures: number;
}

export interface SpecialFunctionData {
  headshipEmploymentFactor: number;
  carryOverLessons: number;
  classTeacher: boolean;
  weeklyLessonsForTransportation: number;
}
```

**backend/shared/schemas.ts:**
```typescript
// Re-export types instead of using z.infer
export type {
  ClassData,
  SpecialFunctionData,
  ProfileData,
} from "./types";
```

## Running the Migration

1. **Install dependencies:**
   ```bash
   cd /Users/devinhasler/projects/scholatempus
   pnpm install
   ```

2. **Verify backend works:**
   ```bash
   cd backend
   npx encore check
   npx encore run
   ```

3. **Update frontend imports (when needed):**
   - Change all `@scholatempus/shared` imports to `scholatempus-backend/shared`
   - Run frontend build to verify

4. **(Optional) Clean up old shared package:**
   ```bash
   # Only do this after confirming everything works
   rm -rf packages/shared
   ```

## Benefits of New Structure

1. **Encore Compatible** - Fully compliant with Encore.ts requirements
2. **Type Safety** - Frontend and backend share the same type definitions
3. **Single Source of Truth** - Backend owns the schemas and types
4. **No Build Step** - No need to pre-transpile shared code
5. **Better IDE Support** - Direct TypeScript imports work seamlessly
6. **Simpler Architecture** - One less package to maintain

## Troubleshooting

### Issue: Frontend can't import from backend
**Solution:** Make sure you've run `pnpm install` in the root and frontend directories to update workspace links.

### Issue: Type mismatches between frontend and backend
**Solution:** Ensure both frontend and backend use the same Zod version (currently `^3.25.67`).

### Issue: Encore can't parse the backend
**Solution:** Make sure you're importing from `~/shared` (not external packages) and that types.ts doesn't use `z.infer`.

## Rollback Plan

If needed, you can rollback by:
1. Restoring `packages/shared` from git history
2. Reverting changes to `backend/package.json`, `tsconfig.json`
3. Reverting import statements in `backend/db/schema.ts` and `backend/app/profile/createProfile.ts`
4. Reverting `frontend/package.json` dependency changes

However, this will bring back the Encore parser issues we were experiencing.

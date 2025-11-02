# Backend Shared Code

This directory contains shared types, schemas, and utilities used throughout the backend application and exported to the frontend.

## Structure

```
shared/
├── enums.ts       # Enum definitions (GradeLevel, WorkTimeCategory)
├── schemas.ts     # Zod validation schemas
├── types.ts       # TypeScript type definitions
├── index.ts       # Main export file
└── README.md      # This file
```

## Usage in Backend

Import using the path alias:

```typescript
import { ClassData, GradeLevel, ClassDataSchema } from "~/shared";
```

Or using relative paths:

```typescript
import { ClassData, GradeLevel } from "../../shared";
```

## Usage in Frontend

The frontend can import from the backend package:

```typescript
import { ClassData, GradeLevel, ClassDataSchema } from "scholatempus-backend/shared";
```

## File Descriptions

### `enums.ts`
Contains TypeScript enums used throughout the application:
- `GradeLevel` - Available grade levels
- `WorkTimeCategory` - Work time categories
- Label mappings for display purposes

### `schemas.ts`
Contains Zod schemas for runtime validation:
- `ClassDataSchema` - Validates class data
- `SpecialFunctionDataSchema` - Validates special function data
- `ProfileDataSchema` - Validates complete profile data
- `WeeklyLessonsForTransportationSchema` - Validates weekly lesson values

### `types.ts`
Contains TypeScript type definitions that match the Zod schemas:
- `ClassData` - Class data type
- `SpecialFunctionData` - Special function data type
- `ProfileData` - Complete profile data type
- `WeeklyLessonsForTransportation` - Weekly lesson type

**Note:** Types are manually maintained to match schemas. This separation is necessary to avoid issues with Encore's parser when using `z.infer`.

## Best Practices

1. **Keep schemas and types in sync** - When updating a schema, update the corresponding type
2. **Use schemas for validation** - Always validate external data with Zod schemas
3. **Use types for type safety** - Use TypeScript types for function signatures and interfaces
4. **Export everything from index.ts** - Keep the public API surface in one place

## Migration Note

This shared code was previously in `packages/shared` as a separate workspace package. It was moved to `backend/shared` to comply with Encore.ts requirements, which mandate that workspace packages must be pre-transpiled. By making this an internal folder of the backend application, we avoid transpilation issues while still allowing the frontend to import these definitions.

# Quick Reference: Database Operation Patterns

## 🎯 Copy-Paste Patterns for Your Endpoints

### Pattern 1: Basic Insert
```typescript
const [newRecord] = await db
  .insert(tableName)
  .values({
    column1: value1,
    column2: value2,
  })
  .returning();

console.log(newRecord.id);  // Use the auto-generated ID
```

---

### Pattern 2: Insert with Specific Return Fields
```typescript
const [newRecord] = await db
  .insert(tableName)
  .values({ ... })
  .returning({ 
    id: tableName.id,
    createdAt: tableName.createdAt 
  });
```

---

### Pattern 3: Find One Record
```typescript
const record = await db.query.tableName.findFirst({
  where: eq(tableName.userId, userId),
});

if (!record) {
  throw APIError.notFound("Record not found");
}
```

---

### Pattern 4: Find with Relations
```typescript
const record = await db.query.profileTable.findFirst({
  where: eq(profileTable.userId, userId),
  with: {
    classData: true,        // Include related table
    specialFunction: true,
    workTimeEntries: true,
  },
});

// Access related data
console.log(record.classData.grade);
console.log(record.workTimeEntries[0].actualHours);
```

---

### Pattern 5: Update Record
```typescript
await db
  .update(tableName)
  .set({
    column1: newValue1,
    column2: newValue2,
  })
  .where(eq(tableName.id, recordId));
```

---

### Pattern 6: Delete Record
```typescript
await db
  .delete(tableName)
  .where(eq(tableName.id, recordId));
```

---

### Pattern 7: Upsert (Insert or Update)
```typescript
await db
  .insert(tableName)
  .values({ userId, name: "John" })
  .onConflictDoUpdate({
    target: [tableName.userId],  // Conflict column(s)
    set: { 
      name: "John Updated",
      updatedAt: new Date(),
    },
  });
```

---

### Pattern 8: Transaction (Multi-Table)
```typescript
await db.transaction(async (tx) => {
  // All operations use 'tx' instead of 'db'
  const [first] = await tx.insert(table1).values({...}).returning();
  const [second] = await tx.insert(table2).values({...}).returning();
  
  await tx.insert(table3).values({
    table1Id: first.id,
    table2Id: second.id,
  });
  
  // If any operation fails, ALL are rolled back
});
```

---

### Pattern 9: Complex Where Clauses
```typescript
import { eq, and, or, gte, lte, isNull, isNotNull, like } from "drizzle-orm";

// Simple equality
where: eq(table.column, value)

// Multiple conditions (AND)
where: and(
  eq(table.userId, userId),
  gte(table.year, 2024),
  lte(table.month, 12)
)

// Multiple conditions (OR)
where: or(
  eq(table.status, "active"),
  eq(table.status, "pending")
)

// NULL checks
where: isNull(table.deletedAt)  // Only non-deleted
where: isNotNull(table.email)   // Must have email

// Pattern matching
where: like(table.name, "%John%")  // Name contains "John"
```

---

### Pattern 10: Count Records
```typescript
import { count } from "drizzle-orm";

const [result] = await db
  .select({ count: count() })
  .from(tableName)
  .where(eq(tableName.userId, userId));

console.log(result.count);  // Number of records
```

---

### Pattern 11: Order and Limit
```typescript
const records = await db
  .select()
  .from(tableName)
  .where(eq(tableName.userId, userId))
  .orderBy(asc(tableName.createdAt))  // or desc()
  .limit(10)
  .offset(0);  // For pagination
```

---

### Pattern 12: Select Specific Columns
```typescript
const results = await db
  .select({
    id: tableName.id,
    name: tableName.name,
    // Only these columns returned
  })
  .from(tableName)
  .where(eq(tableName.userId, userId));
```

---

## 🎯 Common Imports You'll Need

```typescript
// Encore.ts
import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import log from "encore.dev/log";

// Database
import { db } from "../../db/index.js";
import { 
  profileTable, 
  classDataTable, 
  specialFunctionTable,
  workTimeEntryTable 
} from "../../db/schema.js";

// Drizzle operators
import { eq, and, or, gte, lte, asc, desc, isNull } from "drizzle-orm";

// Shared types and schemas
import { 
  ClassDataSchema,
  SpecialFunctionDataSchema,
  type ClassData,
  type SpecialFunctionData 
} from "@scholatempus/shared/schemas";

import { WorkTimeCategory, GradeLevel } from "@scholatempus/shared/enums";
```

---

## 📝 Endpoint Template

```typescript
import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../../db/index.js";
import { tableName } from "../../db/schema.js";
import log from "encore.dev/log";

interface MyEndpointRequest {
  // ... request parameters
}

interface MyEndpointResponse {
  // ... response structure
}

export const myEndpoint = api(
  { 
    expose: true,
    path: "/my-path", 
    method: "POST",  // or GET, PUT, DELETE
    auth: true 
  },
  async (params: MyEndpointRequest): Promise<MyEndpointResponse> => {
    // 1. Get authenticated user
    const userId = getAuthData()!.userID;
    log.info("Operation started", { userId });

    try {
      // 2. Your business logic here
      
      // 3. Database operations
      const result = await db.query.tableName.findFirst({
        where: eq(tableName.userId, userId),
      });

      // 4. Return response
      return {
        success: true,
        data: result,
      };

    } catch (error) {
      if (error instanceof APIError) throw error;
      
      log.error("Operation failed", { userId, error });
      throw APIError.internal("Operation failed", error as Error);
    }
  }
);
```

---

## 🧪 Testing Checklist

For each endpoint, test:

- ✅ **Happy path** - Normal successful request
- ✅ **No auth** - Request without token (401)
- ✅ **Invalid token** - Wrong/expired token (401)
- ✅ **Invalid input** - Bad data format (400)
- ✅ **Not found** - Record doesn't exist (404)
- ✅ **Duplicate** - Already exists (409)
- ✅ **Database error** - Connection issues (500)

---

## 🚀 Next Endpoints to Implement

Use createProfile.ts as your template for:

1. **getProfile.ts** - Use Pattern 4 (Find with Relations)
2. **updateProfile.ts** - Use Pattern 5 (Update) + Pattern 8 (Transaction)
3. **saveWorkTimeEntry.ts** - Use Pattern 7 (Upsert)
4. **getMonthlyOverview.ts** - Use Pattern 4 + calculations

Copy the structure, adjust for your use case, and you're done! 🎯


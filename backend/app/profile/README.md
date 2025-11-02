# Profile API Endpoints

## 📁 File Structure

```
backend/app/profile/
├── createProfile.ts        ✅ IMPLEMENTED - Creates new profile
├── getProfile.ts           📝 TODO - Retrieves profile
├── updateProfile.ts        📝 TODO - Updates existing profile
├── deleteProfile.ts        📝 TODO - Deletes profile
├── saveWorkTimeEntry.ts    📝 TODO - Saves monthly work time
├── getMonthlyOverview.ts   📝 TODO - Gets monthly summary
├── encore.service.ts       ✅ Service definition
├── TEST_EXAMPLES.md        ✅ Test examples and curl commands
└── README.md               ✅ This file
```

---

## 🎯 createProfile.ts - Complete Implementation Guide

### **Flow Diagram**

```
Client Request
    ↓
[1] Authentication Check (getAuthData)
    ↓
[2] Input Validation (Zod schemas)
    ↓
[3] Duplicate Check (db.query.findFirst)
    ↓
[4] Start Transaction
    ↓
[4a] Insert classData → Get ID
    ↓
[4b] Insert specialFunction → Get ID
    ↓
[4c] Insert profile → Link both IDs
    ↓
[5] Commit Transaction
    ↓
[6] Return Success Response
```

---

## 🔑 Key Patterns Demonstrated

### **1. Authentication**
```typescript
const authData = getAuthData();
if (!authData) {
  throw APIError.unauthenticated("Not authenticated");
}
const userId = authData.userID;
```

**Why:** Every protected endpoint needs this. Gets the Clerk user ID from JWT token.

---

### **2. Input Validation**
```typescript
const validatedClassData = ClassDataSchema.parse(params.classData);
```

**Why:** 
- ✅ Runtime type checking
- ✅ Catches invalid data before DB operations
- ✅ Throws clear error messages
- ✅ Uses shared schemas (DRY principle)

---

### **3. Existence Checks**
```typescript
const existingProfile = await db.query.profileTable.findFirst({
  where: eq(profileTable.userId, userId),
});

if (existingProfile) {
  throw APIError.alreadyExists("Profile already exists...");
}
```

**Why:**
- ✅ Prevents duplicate profiles
- ✅ Returns proper HTTP 409 Conflict
- ✅ Gives user helpful error message

---

### **4. Transactions**
```typescript
await db.transaction(async (tx) => {
  const [classData] = await tx.insert(...).returning();
  const [specialFunc] = await tx.insert(...).returning();
  const [profile] = await tx.insert(...).returning();
});
```

**Why:**
- ✅ **Atomic** - All inserts succeed or all fail
- ✅ **Consistent** - No partial data in database
- ✅ **Isolated** - Other transactions don't see partial state
- ✅ **Durable** - Changes are permanent after commit

**Example failure:**
```
✅ Insert classData → Success (ID: 123)
✅ Insert specialFunction → Success (ID: 456)
❌ Insert profile → ERROR!
↩️  ROLLBACK - classData and specialFunction are removed
```

---

### **5. .returning() Pattern**
```typescript
const [record] = await tx
  .insert(classDataTable)
  .values({...})
  .returning({ id: classDataTable.classDataId });

console.log(record.id);  // Use this ID in next insert
```

**Why:**
- ✅ Gets auto-generated IDs immediately
- ✅ No extra SELECT query needed
- ✅ More efficient than insert + select
- ✅ Type-safe - TypeScript knows the shape

**Note:** The `[record]` destructuring is because `.returning()` returns an array.

---

### **6. Error Handling Hierarchy**
```typescript
try {
  // ... operations
} catch (error) {
  if (error instanceof APIError) {
    throw error;  // Already formatted, re-throw
  }
  
  log.error("Unexpected error", { error });
  throw APIError.internal("Failed...", error as Error);
}
```

**Error Types:**
- `APIError.unauthenticated()` → 401
- `APIError.invalidArgument()` → 400
- `APIError.notFound()` → 404
- `APIError.alreadyExists()` → 409
- `APIError.permissionDenied()` → 403
- `APIError.internal()` → 500

---

### **7. Structured Logging**
```typescript
log.info("Creating profile", { userId });
log.info("Class data inserted", { userId, classDataId: record.id });
log.error("Failed to create profile", { userId, error: error.message });
```

**Why:**
- ✅ Searchable logs in production
- ✅ Easy debugging
- ✅ Correlate operations by userId
- ✅ View in Encore dashboard: http://localhost:9400

---

## 🎓 Learning Points

### **Database Operations Used**

| Operation | Code | Purpose |
|-----------|------|---------|
| **Query (relational)** | `db.query.table.findFirst()` | Find one record with relations |
| **Insert** | `db.insert(table).values()` | Insert new record |
| **Return inserted data** | `.returning()` | Get auto-generated fields |
| **Transaction** | `db.transaction(async (tx) => {})` | Atomic multi-table operations |
| **Where clause** | `where: eq(table.col, value)` | Filter records |

---

## 📊 Database Changes

**Before running endpoint:**
```sql
profile: (empty)
classData: (empty)
specialFunctionTable: (empty)
```

**After successful creation:**
```sql
profile:
  user_id: "user_34Ze61..."
  class_data_id: 1
  special_function_id: 1

classData:
  id: 1
  grade: "PRIMARY_SCHOOL_GYM"
  given_lectures: 24
  mandatory_lectures: 28

specialFunctionTable:
  id: 1
  headship_employment_factor: 20.00
  class_teacher: true
```

---

## 🐛 Common Errors

### Error: "Profile already exists"
**Cause:** Trying to create profile twice for same user
**Fix:** Use PUT /profile endpoint to update instead

### Error: "Invalid argument"
**Cause:** Input data doesn't match Zod schema
**Fix:** Check request body matches ClassData and SpecialFunctionData types

### Error: "Not authenticated"
**Cause:** Missing or invalid JWT token
**Fix:** Include valid Bearer token in Authorization header

### Error: "Database error"
**Cause:** Foreign key constraint, unique violation, etc.
**Fix:** Check database schema and constraints

---

## 🎯 Use This Pattern For Other Endpoints

**For GET endpoints:**
- Skip validation (no input)
- Use `db.query.table.findFirst()` with `.with()` for relations
- Return the data

**For PUT endpoints:**
- Validate input
- Check existence first
- Use `db.update(table).set().where()`
- Use transactions if updating multiple tables

**For DELETE endpoints:**
- Check existence first
- Use transactions
- Delete children first, then parent (or use CASCADE)

**For POST (create) endpoints:**
- Follow the createProfile pattern exactly!


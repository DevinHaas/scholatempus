# Testing the Create Profile Endpoint

## 📋 Prerequisites

1. Backend running: `encore run` in backend directory
2. Database running and schema pushed: `drizzle-kit push`
3. Valid JWT token from Clerk (see frontend test-token page)

---

## 🧪 Test 1: Create Profile with curl

```bash
# Get your JWT token first
TOKEN="your_jwt_token_here"

# Create a profile
curl -X POST http://localhost:4000/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "classData": {
      "grade": "PRIMARY_SCHOOL_GYM",
      "givenLectures": 24,
      "mandatoryLectures": 28,
      "carryOverLectures": 0
    },
    "specialFunctionData": {
      "headshipEmploymentFactor": 20,
      "carryOverLessons": 0,
      "classTeacher": true,
      "weeklyLessonsForTransportation": 1
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "userId": "user_34Ze61uriJSDVopgKl5QJgUtw4E",
  "message": "Profile created successfully"
}
```

---

## 🧪 Test 2: Try to Create Duplicate (Should Fail)

```bash
# Run the same curl command again
curl -X POST http://localhost:4000/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "classData": {
      "grade": "PRIMARY_SCHOOL_GYM",
      "givenLectures": 24,
      "mandatoryLectures": 28,
      "carryOverLectures": 0
    },
    "specialFunctionData": {
      "headshipEmploymentFactor": 20,
      "carryOverLessons": 0,
      "classTeacher": true,
      "weeklyLessonsForTransportation": 1
    }
  }'
```

**Expected Response (409 Conflict):**
```json
{
  "code": "already_exists",
  "message": "Profile already exists for this user. Use PUT /profile to update."
}
```

---

## 🧪 Test 3: Invalid Input (Should Fail Validation)

```bash
# Send invalid data (negative lectures)
curl -X POST http://localhost:4000/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "classData": {
      "grade": "PRIMARY_SCHOOL_GYM",
      "givenLectures": -5,
      "mandatoryLectures": 28,
      "carryOverLectures": 0
    },
    "specialFunctionData": {
      "headshipEmploymentFactor": 20,
      "carryOverLessons": 0,
      "classTeacher": true,
      "weeklyLessonsForTransportation": 1
    }
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "code": "invalid_argument",
  "message": "Validation failed"
}
```

---

## 🧪 Test 4: Missing Authentication (Should Fail)

```bash
# No Authorization header
curl -X POST http://localhost:4000/profile \
  -H "Content-Type: application/json" \
  -d '{
    "classData": {
      "grade": "PRIMARY_SCHOOL_GYM",
      "givenLectures": 24,
      "mandatoryLectures": 28,
      "carryOverLectures": 0
    },
    "specialFunctionData": {
      "headshipEmploymentFactor": 20,
      "carryOverLessons": 0,
      "classTeacher": true,
      "weeklyLessonsForTransportation": 1
    }
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "code": "unauthenticated",
  "message": "Not authenticated"
}
```

---

## 🔍 Verify in Database

After successful creation:

```bash
# Connect to your database
psql $DATABASE_URL

# Check profile was created
SELECT * FROM profile;

# Check class data
SELECT * FROM "classData";

# Check special function data
SELECT * FROM "specialFunctionTable";

# Check all related data
SELECT 
  p.user_id,
  c.grade,
  c.given_lectures,
  s.headship_employment_factor,
  s.class_teacher
FROM profile p
LEFT JOIN "classData" c ON p.class_data_id = c.id
LEFT JOIN "specialFunctionTable" s ON p.special_function_id = s.id;
```

---

## 📊 What the Endpoint Does

1. **Authentication**: Gets userId from Clerk JWT token
2. **Validation**: Validates input with Zod schemas
3. **Duplicate Check**: Ensures profile doesn't already exist
4. **Transaction**: Inserts data atomically:
   - Creates classData record → gets ID
   - Creates specialFunction record → gets ID
   - Creates profile record → links to both IDs
5. **Error Handling**: Returns appropriate HTTP status codes
6. **Logging**: Logs each step for debugging

---

## 🎯 Key Patterns Used

- ✅ `getAuthData()` - Get authenticated user
- ✅ `Schema.parse()` - Runtime validation
- ✅ `db.query.table.findFirst()` - Check existence
- ✅ `db.transaction()` - Atomic operations
- ✅ `.returning()` - Get inserted IDs
- ✅ `APIError.*` - Proper error responses
- ✅ `log.info/error()` - Structured logging

---

## 🚀 Next Steps

Use this as a template for:
- `updateProfile.ts` - Update existing profile
- `getProfile.ts` - Retrieve profile data
- `deleteProfile.ts` - Delete profile
- `saveWorkTimeEntry.ts` - Save monthly time entries


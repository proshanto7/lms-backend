# LMS API — Frontend Integration Guide

Complete REST API reference for the backend. This document is written for
frontend engineers integrating against the API — every module, every
endpoint, required auth, request bodies, and response shapes are documented
below.

> **Base URL:** `{{API_BASE_URL}}/api/v1` (confirm the exact prefix with the
> backend team / your `app.js`)

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Authentication](#2-authentication)
3. [Auth & Users](#3-auth--users-base-auth)
4. [Categories](#4-categories-base-categories)
5. [Courses](#5-courses-base-courses)
6. [Lessons](#6-lessons-base-lesson)
7. [Progress](#7-progress-base-progress)
8. [Enrollment (Admin Direct)](#8-enrollment-base-enrollments)
9. [Enrollment Requests (Student → Admin Approval)](#9-enrollment-requests-base-enrollment-requests)
10. [Dashboard](#10-dashboard-base-dashboard)
11. [Role & Permission Matrix](#11-role--permission-matrix)
12. [File Uploads](#12-file-uploads)
13. [Error Handling](#13-error-handling)

---

## 1. Conventions

### Response envelope

Every endpoint — success or failure — returns the same JSON shape:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { }
}
```

- `success` — `true` for `2xx`, `false` for `4xx` / `5xx`.
- `message` — always safe to show to the user as-is.
- `data` — payload described per-endpoint below. `null` when there's nothing
  to return (e.g. delete/logout).

### HTTP methods

| Method | Use                          |
|--------|-------------------------------|
| GET    | Read data                    |
| POST   | Create a resource             |
| PATCH  | Partially update a resource   |
| DELETE | Delete / deactivate / revoke  |

### IDs

All `:id` params are MongoDB ObjectIds (24-char hex strings). Sending an
invalid format returns a `400` validation error before hitting the database.

### Headers

```
Content-Type: application/json
```

For file-upload endpoints, use `multipart/form-data` instead (see
[§12 File Uploads](#12-file-uploads)).

---

## 2. Authentication

Auth is JWT-based and supports **two transport methods simultaneously** —
use whichever fits your frontend:

| Method            | How it works |
|-------------------|--------------|
| **Cookie** (recommended for web) | On login/register, the server sets an `httpOnly` cookie named `accessToken`. Send requests with `credentials: "include"` (fetch) or `withCredentials: true` (axios) and you're authenticated automatically — no manual header needed. |
| **Bearer token**  | The login/register response also returns `data.token`. Store it (memory / secure storage — **not** `localStorage` for production web apps) and send it as `Authorization: Bearer <token>` on every request. |

- Every protected route requires the user's account to be **verified**
  (`isVerified: true` — see [Email Verification](#email-verification)) and,
  where noted, **active** (`isActive: true`).
- Unauthenticated / invalid / expired token → `401`.
- Wrong role for the route → `401` with a message naming the allowed role(s).

---

## 3. Auth & Users — base `/auth`

> ⚠️ Confirm the actual mount path with the backend team (commonly `/auth`
> or `/users`).

### Public

| Method | Endpoint | Body | Notes |
|--------|----------|------|-------|
| POST | `/register` | `{ name, email, password, phone? }` | Creates a `student` account. Returns `{ user, token }` and sets the `accessToken` cookie. |
| POST | `/login` | `{ email, password }` | Returns `{ user, token }` and sets the `accessToken` cookie. |
| POST | `/verify-email` | `{ email, otp }` (6-digit) | Confirms the OTP sent by email at registration. |
| POST | `/resend-verification` | `{ email }` | Re-sends the verification OTP. |

#### Forgot password (3-step flow)

| Step | Method | Endpoint | Body |
|------|--------|----------|------|
| 1 | POST | `/forgot-password` | `{ email }` — sends an OTP to the user's email |
| 2 | POST | `/verify-reset-otp` | `{ email, otp }` — returns `data.resetToken` |
| 3 | POST | `/reset-password` | `{ resetToken, newPassword }` |

### Protected — any logged-in user

| Method | Endpoint | Body | Notes |
|--------|----------|------|-------|
| GET | `/me` | — | Current user's profile |
| PATCH | `/me` | `multipart/form-data`: `name?, phone?, avatar?(file)` | Updates own profile; `avatar` field is a file upload |
| PATCH | `/change-password` | `{ currentPassword, newPassword }` | |
| DELETE | `/me` | — | Deactivates (soft-deletes) own account |
| POST | `/logout` | — | Clears the `accessToken` cookie |

### Admin only

| Method | Endpoint | Body | Notes |
|--------|----------|------|-------|
| GET | `/` | query: `page?, limit?, search?, role?` | List/search all users, paginated |
| POST | `/` | `multipart/form-data`: `name, email, password, role (student\|mentor\|admin), phone?, avatar?(file)` | Admin-created account (e.g. mentor) |
| PATCH | `/:id` | `multipart/form-data`: `name?, email?, password?, phone?, avatar?(file)` | Edit any user |
| PATCH | `/:id/role` | `{ role: "student"\|"mentor"\|"admin" }` | Change a user's role |
| PATCH | `/:id/status` | `{ isActive: true\|false }` | Activate / deactivate a user |
| DELETE | `/:id` | — | Permanently delete a user |

**User object shape** (`data.user` / list items):

```json
{
  "_id": "66f...",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "01700000000",
  "avatar": "https://res.cloudinary.com/.../avatar.jpg",
  "role": "student",
  "isVerified": true,
  "isActive": true,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

---

## 4. Categories — base `/categories`

### Public

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/` | query: `page?, limit?, search?` → `{ categories, pagination }` (each category includes a `courseCount`) |
| GET | `/slug/:slug` | Fetch by human-readable slug |
| GET | `/:id` | Fetch by ID |

### Admin only

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/` | `multipart/form-data`: `name, description?, color?(hex), icon?(file)` |
| PATCH | `/:id` | `multipart/form-data`: any of the above, all optional |
| DELETE | `/:id` | — |

**Category object shape:**

```json
{
  "_id": "66f...",
  "name": "Web Development",
  "slug": "web-development",
  "description": "...",
  "color": "#7c6fe8",
  "icon": { "url": "https://...", "publicId": "..." },
  "courseCount": 12
}
```

---

## 5. Courses — base `/courses`

### Public

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/` | query: `page?, limit?, search?, category?, level?, isFree?, isPublished?, minPrice?, maxPrice?` → `{ courses, pagination: { total, page, pages } }` |
| GET | `/slug/:slug` | Fetch by slug (course details page) |
| GET | `/:id` | Fetch by ID |

### Admin only

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/` | `multipart/form-data`: `title, description, category(id), instructor(id), price, level?, language?, discountPrice?, isFree?, totalDuration?, totalLectures?, requirements?[], whatYouWillLearn?[], isPublished?, image(file, required)` |
| PATCH | `/:id` | Same fields, all optional, `image?(file)` |
| DELETE | `/:id` | — |

**Course object shape:**

```json
{
  "_id": "66f...",
  "title": "Complete Node.js Bootcamp",
  "slug": "complete-nodejs-bootcamp",
  "description": "...",
  "category": { "_id": "...", "name": "Web Development", "slug": "...", "color": "...", "icon": {} },
  "instructor": { "_id": "...", "name": "John Mentor", "email": "...", "avatar": "...", "role": "mentor" },
  "level": "beginner",
  "language": "English",
  "price": 1500,
  "discountPrice": 999,
  "isFree": false,
  "totalDuration": 480,
  "totalLectures": 42,
  "requirements": ["Basic JavaScript"],
  "whatYouWillLearn": ["Build REST APIs", "..."],
  "rating": 4.5,
  "students": 120,
  "isPublished": true,
  "image": { "url": "https://...", "publicId": "..." },
  "createdAt": "..."
}
```

---

## 6. Lessons — base `/lesson`

Lesson content is access-gated: only enrolled students (or `isPreview: true`
lessons) can actually watch the video — enforced server-side inside the
service layer, not just by the route.

| Method | Endpoint | Access | Notes |
|--------|----------|--------|-------|
| GET | `/course/:courseId` | Public (optional auth) | Lists lessons for a course. Logged-out / non-enrolled users see metadata only (title, order, `isPreview`) — video URL is withheld unless the lesson is a preview or the user has access. |
| GET | `/:id` | Logged in | Full lesson (incl. video) — error if the student isn't enrolled and it isn't a preview lesson |
| POST | `/` | Admin | `multipart/form-data`: `course(id), title, order, description?, isPreview?, video(file: mp4/webm/mov, required)` |
| PATCH | `/:id` | Admin | Same fields, all optional, `video?(file)` |
| DELETE | `/:id` | Admin | — |

**Lesson object shape:**

```json
{
  "_id": "66f...",
  "course": "66f...",
  "title": "01 - Introduction",
  "description": "...",
  "video": { "url": "https://...", "publicId": "...", "duration": 620 },
  "order": 1,
  "isPreview": false,
  "createdAt": "..."
}
```

---

## 7. Progress — base `/progress`

Tracks which lessons a student has finished, per course.

### Student

| Method | Endpoint | Body | Notes |
|--------|----------|------|-------|
| POST | `/complete` | `{ lessonId }` | Marks a lesson as completed for the logged-in student |
| DELETE | `/:lessonId` | — | Marks a lesson as incomplete (undo) |
| GET | `/course/:courseId` | — | This student's progress within one course |
| GET | `/my-overview` | — | `{ overview }` — this student's progress across **all** enrolled courses |

### Admin

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/course/:courseId/student/:studentId` | A specific student's progress in a specific course (e.g. for a mentor/admin view) |

---

## 8. Enrollment — base `/enrollments`

**Direct admin enrollment.** Use this when an admin enrolls a student
immediately, with no approval step (e.g. manual/offline payment already
confirmed). For the "student requests, admin approves" flow, see
[§9 Enrollment Requests](#9-enrollment-requests-base-enrollment-requests).

| Method | Endpoint | Access | Body |
|--------|----------|--------|------|
| POST | `/` | Admin | `{ studentId, courseId }` — enrolls immediately |
| PATCH | `/:id/revoke` | Admin | Revokes access without deleting the record |
| GET | `/course/:courseId` | Admin | All active enrollments for a course |
| GET | `/student/:studentId` | Admin | All active enrollments for a student |
| GET | `/my` | Student | The logged-in student's own active enrollments |

**Enrollment object shape:**

```json
{
  "_id": "66f...",
  "student": { "_id": "...", "name": "...", "email": "...", "avatar": "..." },
  "course": { "_id": "...", "title": "...", "slug": "...", "price": 1500, "isFree": false, "image": "..." },
  "enrolledBy": "66f... (admin userId)",
  "status": "active",
  "createdAt": "..."
}
```

---

## 9. Enrollment Requests — base `/enrollment-requests`

**Student → Admin approval flow.** This is what powers the *"student
requests a course from the website, admin reviews and approves from the
dashboard"* feature.

```
student submits request  →  status: "pending"
                          →  shows up in admin dashboard
admin approves             →  a real Enrollment is created automatically
                               (via the Enrollment module) + request → "approved"
        or
admin rejects               →  request → "rejected" (student can re-request later)
```

### Student

| Method | Endpoint | Body | Notes |
|--------|----------|------|-------|
| POST | `/` | `{ courseId, note? }` | Submit a request to enroll in a course. `note` is optional (e.g. "paid via bKash, txn #123"). `409` if already actively enrolled or a pending request already exists for that course. |
| GET | `/my` | — | All of this student's requests (any status), newest first |
| DELETE | `/:id` | — | Cancel your own request — only while it's still `pending` |

### Admin

| Method | Endpoint | Query / Body | Notes |
|--------|----------|---------------|-------|
| GET | `/?status=pending` | query: `status?` (`pending`\|`approved`\|`rejected`, omit for all) | List requests — this is what the dashboard's "requests" panel calls |
| PATCH | `/:id/approve` | — | Approves the request **and** creates the actual `Enrollment` record in one call |
| PATCH | `/:id/reject` | `{ reason? }` | Rejects the request; `reason` is stored as `reviewNote` |

**Enrollment request object shape:**

```json
{
  "_id": "66f...",
  "student": { "_id": "...", "name": "...", "email": "...", "avatar": "..." },
  "course": { "_id": "...", "title": "...", "slug": "...", "price": 1500, "isFree": false, "image": "..." },
  "note": "Paid via bKash, txn #123",
  "status": "pending",
  "reviewedBy": null,
  "reviewNote": "",
  "reviewedAt": null,
  "createdAt": "2026-09-20T10:00:00.000Z"
}
```

`PATCH /:id/approve` response `data`:

```json
{
  "request": { "...": "...", "status": "approved" },
  "enrollment": { "...": "the newly created Enrollment record" }
}
```

### Suggested frontend flow

- **Student side (course page):** show an "Enroll" button → `POST
  /enrollment-requests`. Disable the button / show "Pending approval" if
  `GET /enrollment-requests/my` already has a `pending` entry for that
  course. Show "Enrolled" if `GET /enrollments/my` has an active entry.
- **Admin dashboard:** a "Pending Requests" table fed by `GET
  /enrollment-requests?status=pending` (or the same list embedded in `GET
  /dashboard/summary`, see below) with **Approve** / **Reject** buttons
  wired to the two `PATCH` routes.

---

## 10. Dashboard — base `/dashboard`

Admin-only. One endpoint powers the entire dashboard homepage.

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/summary` | Admin |

**Response `data` shape:**

```json
{
  "overview": {
    "totalStudents": 340,
    "totalMentors": 12,
    "totalCourses": 48,
    "totalCategories": 9,
    "totalActiveEnrollments": 512,
    "totalLessons": 610,
    "totalRevenue": 458200,
    "pendingEnrollmentRequests": 7
  },
  "recentEnrollments": [ "last 5 Enrollment objects, populated" ],
  "topCourses": [
    { "courseId": "...", "title": "...", "slug": "...", "price": 1500, "image": "...", "enrollmentCount": 88 }
  ],
  "enrollmentTrend": [
    { "year": 2026, "month": 4, "count": 40 }
  ],
  "pendingEnrollmentRequests": [ "up to 10 latest, populated — see section 9 shape" ]
}
```

Use:
- `overview` → the stat cards at the top of the dashboard.
- `pendingEnrollmentRequests` (array) → the "needs your review" list/table;
  each row's Approve/Reject buttons hit the [§9](#9-enrollment-requests-base-enrollment-requests)
  endpoints.
- `recentEnrollments`, `topCourses`, `enrollmentTrend` → activity feed /
  charts.

---

## 11. Role & Permission Matrix

| Action | Public | Student | Mentor | Admin |
|---|:---:|:---:|:---:|:---:|
| Browse courses / categories | ✅ | ✅ | ✅ | ✅ |
| Watch preview lessons | ✅ | ✅ | ✅ | ✅ |
| Watch full course lessons | ❌ | ✅ (if enrolled) | — | — |
| Request enrollment | ❌ | ✅ | ❌ | ❌ |
| Approve / reject enrollment requests | ❌ | ❌ | ❌ | ✅ |
| Enroll a student directly | ❌ | ❌ | ❌ | ✅ |
| Create / edit courses, lessons, categories | ❌ | ❌ | ❌ | ✅ |
| View dashboard | ❌ | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ |

> `mentor` currently has no dedicated endpoints beyond the shared "any
> logged-in user" routes (`/auth/me`, etc.) — they're assigned to courses as
> `instructor` by an admin.

---

## 12. File Uploads

Any endpoint listed above with a field like `image?(file)`, `avatar?(file)`,
`icon?(file)`, or `video(file)` expects **`multipart/form-data`**, not JSON.
Example with `fetch`:

```js
const form = new FormData();
form.append("title", "Complete Node.js Bootcamp");
form.append("description", "...");
form.append("category", categoryId);
form.append("instructor", instructorId);
form.append("price", "1500");
form.append("image", fileInput.files[0]);

await fetch(`${API_BASE_URL}/api/v1/courses`, {
  method: "POST",
  credentials: "include", // sends the accessToken cookie
  body: form, // do NOT set Content-Type manually — the browser sets the multipart boundary
});
```

| Field | Accepted types | Max size |
|---|---|---|
| User `avatar` | jpg, png, webp | 2 MB |
| Category `icon` | jpg, png, webp, svg | 2 MB |
| Course `image` | jpg, png, webp | 3 MB |
| Lesson `video` | mp4, webm, mov | 100 MB |

Uploaded files are stored on Cloudinary; the API returns `{ url, publicId }`
— always render `url` and keep `publicId` around only if you need to
reference/delete the asset later (you generally won't from the frontend).

---

## 13. Error Handling

All errors use the same envelope, with `success: false`.

**Standard error:**

```json
{
  "success": false,
  "message": "Course not found",
  "data": null
}
```

**Validation error** (`400`, from Joi) — has an extra `errors` object, keyed
by field name, ready to map directly onto form fields:

```json
{
  "success": false,
  "message": "JOI Validation failed",
  "errors": {
    "email": "Please enter a valid email",
    "password": "Password must be at least 8 characters"
  }
}
```

**Common status codes:**

| Code | Meaning |
|---|---|
| 400 | Validation error / bad request |
| 401 | Not authenticated, invalid/expired token, unverified account, or wrong role |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate enrollment, duplicate pending request, already registered email) |
| 500 | Unexpected server error |

**Frontend tip:** treat `message` as the safe, user-facing string for
toasts/alerts. Use `errors` (when present) to highlight specific form
fields instead of showing a generic message.

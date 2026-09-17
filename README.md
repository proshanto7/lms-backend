# SBR Backend API — Quick Reference

**Base URL:** `http://localhost:4040/api/v1`

## Setup

```js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4040/api/v1",
  withCredentials: true, // required — auth uses HTTP-only cookies
});
```

## Response Format

```json
// Success
{ "success": true, "message": "...", "data": {} }

// Error
{ "success": false, "message": "..." }
```

## Endpoints

| Method | Endpoint | Auth | Role | Body |
|---|---|---|---|---|
| POST | `/auth/register` | No | Public | `name, email, password, phone?` |
| POST | `/auth/login` | No | Public | `email, password` |
| POST | `/auth/verify-email` | No | Public | `email, otp` (6 digits) |
| POST | `/auth/resend-verification` | No | Public | `email` |
| POST | `/auth/forgot-password` | No | Public | `email` |
| POST | `/auth/verify-reset-otp` | No | Public | `email, otp` |
| PATCH | `/auth/reset-password` | No | Public | `email, newPassword` |
| POST | `/auth/logout` | Yes | User | — |
| GET | `/users/me` | Yes | User | — |
| PATCH | `/users/me` | Yes | User | `name, phone, avatar` |
| PATCH | `/users/change-password` | Yes | User | `currentPassword, newPassword` |
| DELETE | `/users/me` | Yes | User | — (sets `isActive: false`) |
| GET | `/users` | Yes | Admin | query: `page, limit, role` |
| PATCH | `/users/:id/role` | Yes | Admin | `role` (`student/mentor/admin`) |

## Key Rules

- **Never send `role`** on register — new users default to `student`.
- **Never send** `role, email, password, isVerified, isActive` via `PATCH /users/me`.
- **`confirmPassword`** is frontend-only validation; don't send it to the backend.
- **Never store passwords** in localStorage/sessionStorage/Redux/Zustand/URL.
- On app startup, call `GET /users/me` to restore session; on `401` → logged out.

## Password Reset Flow

```
Email → Send OTP → Verify OTP → New Password + Confirm → Reset → Login
```
No reset token shown to the user — handled via email verification.

## Suggested Frontend Routes

```
/login  /register  /verify-email
/forgot-password  /verify-reset-otp  /reset-password
/profile  /change-password
/admin/users
```

## Dev

```
npm run dev        # runs on http://localhost:4040
GET /               → "Server running 🚀"
GET /api/v1         → { "message": "API v1 working ✅" }
```
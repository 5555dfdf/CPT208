# Storylens Authentication API (Draft)

This document defines frontend-backend contracts for registration and forgot-password flows.

## Base URL

- Default relative path: `/api`
- Optional override via `.env`: `VITE_API_BASE=http://127.0.0.1:8787`

## 1) Register

- Method: `POST`
- Path: `/api/auth/register`

### Request Body

```json
{
  "name": "Story Seeker",
  "email": "user@example.com",
  "password": "123456"
}
```

### Success Response (200 / 201)

```json
{
  "ok": true,
  "user": {
    "id": "u_1001",
    "name": "Story Seeker",
    "email": "user@example.com"
  },
  "token": "jwt-or-session-token"
}
```

### Error Response (400 / 409 / 500)

```json
{
  "ok": false,
  "message": "Email already exists"
}
```

## 2) Forgot Password - Send Verification Code

- Method: `POST`
- Path: `/api/auth/password/request-code`

### Request Body

```json
{
  "email": "user@example.com"
}
```

### Success Response (200)

```json
{
  "ok": true,
  "message": "Verification code sent"
}
```

## 3) Forgot Password - Reset Password

- Method: `POST`
- Path: `/api/auth/password/reset`

### Request Body

```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "new-password"
}
```

### Success Response (200)

```json
{
  "ok": true,
  "message": "Password reset successful"
}
```

### Error Response (400 / 404 / 410 / 500)

```json
{
  "ok": false,
  "message": "Verification code invalid or expired"
}
```

## 4) Login (Recommended Contract)

- Method: `POST`
- Path: `/api/auth/login`

### Request Body

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

### Success Response

```json
{
  "ok": true,
  "user": {
    "id": "u_1001",
    "name": "Story Seeker",
    "email": "user@example.com"
  },
  "token": "jwt-or-session-token"
}
```

## Frontend Integration Notes

- Placeholder implementation file: `src/utils/authApi.js`
- Mock mode default: `VITE_USE_MOCK_AUTH=true`
- When backend is ready:
1. Set `VITE_USE_MOCK_AUTH=false`
2. Configure `VITE_API_BASE`
3. Keep request/response fields aligned with this doc


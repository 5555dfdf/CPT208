import { buildApiUrl } from "@/utils/api";

/**
 * Auth API placeholder.
 * Set VITE_USE_MOCK_AUTH=false when backend endpoints are ready.
 */

function useMockAuth() {
  return (import.meta.env.VITE_USE_MOCK_AUTH || "true") === "true";
}

export async function registerUser(payload) {
  if (useMockAuth()) {
    await new Promise((resolve) => setTimeout(resolve, 220));
    return {
      ok: true,
      user: {
        id: "mock-user-id",
        name: payload.name,
        email: payload.email,
      },
      token: "mock-token",
    };
  }

  const res = await fetch(buildApiUrl("/api/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await readApiError(res, "Register failed."));
  }
  return res.json();
}

export async function requestPasswordReset(payload) {
  if (useMockAuth()) {
    await new Promise((resolve) => setTimeout(resolve, 260));
    return { ok: true, message: "Processed in mock mode." };
  }

  const path = payload?.newPassword
    ? "/api/auth/password/reset"
    : "/api/auth/password/request-code";

  const res = await fetch(buildApiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await readApiError(res, "Password reset request failed."));
  }
  return res.json();
}

async function readApiError(res, fallback) {
  try {
    const data = await res.json();
    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }
  } catch {
    // ignore parse error
  }
  return `${fallback} (${res.status})`;
}


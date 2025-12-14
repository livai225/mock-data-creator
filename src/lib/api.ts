const API_URL = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:5000";

export type ApiResult<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type AuthUser = {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role?: string;
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  });

  const json = (await res.json().catch(() => null)) as any;

  if (!res.ok) {
    const message = json?.message ?? `HTTP ${res.status}`;
    throw new Error(message);
  }

  return json as T;
}

export async function registerApi(email: string, password: string) {
  return apiRequest<ApiResult<{ user: AuthUser; token: string }>>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function loginApi(email: string, password: string) {
  return apiRequest<ApiResult<{ user: AuthUser; token: string }>>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function meApi(token: string) {
  return apiRequest<ApiResult<AuthUser>>("/api/auth/me", {
    method: "GET",
    token,
  });
}
